# NexviaMart REST API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication & Users (`/api/auth`)

### `POST /api/auth/register`
Creates a customer or vendor account.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "customer", // or "vendor"
    "storeName": "Jane's Boutique" // required if role === 'vendor'
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body:** `{ "email": "customer@nexviamart.com", "password": "CustomerPassword123!" }`
- **Response (200 OK):** `{ "success": true, "token": "...", "user": { ... } }`

### `GET /api/auth/me`
Retrieves currently authenticated user profile and address book.

---

## 2. Vendor Management (`/api/vendors`)

### `GET /api/vendors`
Returns all verified and approved marketplace vendor storefronts.

### `POST /api/vendors/onboard` *(Protected: Vendor/Admin)*
Configures or updates vendor store branding, bank account details, and payment gateway IDs.
- **Request Body:**
  ```json
  {
    "storeName": "TechNova Global",
    "description": "Premium consumer electronics retailer",
    "stripeAccountId": "acct_1TechNovaStripeConnect",
    "razorpayAccountId": "acc_1TechNovaRazorpayRoute"
  }
  ```

### `GET /api/vendors/stats` *(Protected: Vendor/Admin)*
Returns vendor financial performance: gross sales, platform commission paid, net earnings, and order log.

---

## 3. Product Catalog & S3 Media (`/api/products`)

### `GET /api/products`
Retrieves products with query filters, pagination, and sorting.
- **Query Params:** `category`, `brand`, `vendorId`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`

### `POST /api/products` *(Protected: Vendor/Admin)*
Creates a new product and automatically synchronizes with Elasticsearch index.

### `POST /api/products/upload` *(Protected: Vendor/Admin)*
Uploads an image file to AWS S3 bucket (or local media fallback) via multipart/form-data.
- **Response (200 OK):** `{ "success": true, "url": "https://bucket.s3.amazonaws.com/products/image.jpg" }`

### `PUT /api/products/:id` *(Protected: Vendor/Admin)*
Updates product details and re-indexes the document.

### `DELETE /api/products/:id` *(Protected: Vendor/Admin)*
Removes product and purges it from Elasticsearch.

---

## 4. Search & Facets (`/api/search`)

### `GET /api/search`
Elasticsearch-powered full-text search with faceted aggregations.
- **Query Params:** `q`, `category`, `brand`, `minPrice`, `maxPrice`, `minRating`, `sortBy`, `page`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "total": 9,
    "page": 1,
    "totalPages": 1,
    "hits": [ ... ],
    "aggregations": {
      "categories": [{ "key": "Electronics", "count": 3 }, { "key": "Fashion", "count": 3 }],
      "brands": [{ "key": "SoundMaster", "count": 1 }]
    }
  }
  ```

### `GET /api/search/suggestions`
Returns real-time autocomplete suggestions matching search prefix.

---

## 5. Shopping Cart (`/api/cart`)

Cached in Redis with 7-day TTL mapped to user or guest session UUID (`x-guest-session`).

- `GET /api/cart`: Fetches cart with validated stock and current prices.
- `POST /api/cart/add`: `{ "productId": "...", "quantity": 1 }`
- `PUT /api/cart/update`: `{ "productId": "...", "quantity": 3 }`
- `DELETE /api/cart/item/:productId`: Removes specific item.
- `DELETE /api/cart/clear`: Clears current cart.

---

## 6. Orders & Split Checkout (`/api/orders`)

### `POST /api/orders` *(Protected)*
Validates cart items, calculates multi-vendor commissions, executes payment split, and deducts inventory.
- **Request Body:**
  ```json
  {
    "items": [{ "productId": "...", "quantity": 1 }],
    "shippingAddress": {
      "fullName": "Alex Rivera",
      "street": "742 Evergreen Terrace",
      "city": "Springfield",
      "state": "OR",
      "zipCode": "97477"
    },
    "couponCode": "WELCOME20",
    "paymentGateway": "stripe" // or "razorpay"
  }
  ```

### `GET /api/orders/:id` *(Protected)*
Returns order details, timeline event history, and split breakdown.

### `PUT /api/orders/:id/status` *(Protected: Vendor/Admin)*
Advances the order lifecycle (`placed` -> `packed` -> `shipped` -> `delivered`).

---

## 7. Invoices (`/api/invoices`)

- `GET /api/invoices/:orderId`: Returns JSON invoice details with vendor itemization.
- `GET /api/invoices/:orderId/download`: Streams generated PDF tax invoice directly for download.

---

## 8. Admin Analytics (`/api/analytics/admin`) *(Protected: Admin)*
Returns comprehensive platform metrics:
- Gross Merchandise Value (GMV)
- Total Platform Commissions
- Disbursed Vendor Payouts
- Top Selling Vendors & Products
- Category sales breakdown
- 7-day revenue trend data
