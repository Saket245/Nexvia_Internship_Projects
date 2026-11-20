# NexviaMart - Multi-Vendor E-Commerce Platform

NexviaMart is a full-stack multi-vendor e-commerce marketplace built with React, Node.js, Express, and MongoDB. Independent vendors can register, manage their product catalog, and track earnings, while customers can browse products, apply discount coupons, checkout with split payments, and track order fulfillment. Platform administrators have access to platform-level analytics and vendor management.

---

## Architecture Overview

The application is structured into a decoupled frontend and backend:

1. **Frontend (client):**
   - Single-page application built with React 18, Vite, and Tailwind CSS.
   - Client-side routing with role-based access control for customers, vendors, and admins.
   - Context API for authentication state and shopping cart persistence with guest session fallback.

2. **Backend (server):**
   - REST API built with Node.js and Express.
   - Token-based authentication using JSON Web Tokens (JWT) stored in HTTP headers and BCrypt for password hashing.
   - Modular architecture separating routes, controllers, middleware, and database models.

3. **Database-First (DB-First) Design:**
   - MongoDB is used as the primary database with a database-first design approach.
   - Database collections, schema validation rules ($jsonSchema), and indexes are defined at the database engine level rather than relying solely on application-level code.
   - Mongoose models operate with `autoCreate: false` and `autoIndex: false` to consume the database structure rather than driving it lazily.
   - A standalone migration script (`npm run db:init` or `server/scripts/schema.mongodb.js`) can be executed directly against MongoDB or inside MongoDB Compass.
   - For evaluation without an external MongoDB daemon running, the backend includes an embedded in-memory MongoDB fallback.

4. **Search and Caching Infrastructure:**
   - Catalog search engine providing text matching, category filtering, price range facets, and rating filters.
   - Session and cart caching layer with a 7-day TTL.

5. **Payment Settlement:**
   - Multi-vendor payment splitting logic supporting platform commission calculation and merchant payouts (Stripe Connect and Razorpay Route interfaces).

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM (Database-First with native $jsonSchema validation)
- **Search Engine:** Elasticsearch client with in-memory faceted query engine
- **Cache & Sessions:** Redis client with in-memory session store
- **Payments:** Stripe Connect and Razorpay Route split settlement logic
- **File Storage:** AWS S3 SDK with local file system fallback
- **Invoice Generation:** jsPDF

---

## Features

### Customer
- Browse products with faceted filtering (category, price range, ratings, brands).
- Full-text search with instant query filtering.
- Guest shopping cart with automatic migration upon login.
- Promo coupon redemption at checkout.
- Multi-vendor checkout with individual line item tracking.
- Order tracking timeline showing fulfillment status (placed, packed, shipped, delivered).
- PDF invoice download for completed orders.
- Product review and rating submission.

### Vendor
- Self-serve vendor onboarding and profile setup.
- Product catalog management (add, edit, delete products with image upload).
- Sales dashboard showing total revenue, platform commission fees, and net payouts.
- Order management with the ability to update shipping status.

### Admin
- Platform-level analytics dashboard with revenue charts and gross merchandise value (GMV).
- Commission fee configuration and vendor payout oversight.
- Full visibility over platform vendors, products, and customer orders.

---

## Project Structure

```
multivendor-marketplace/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OrderLifecycleStepper.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── CustomerOrders.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Shop.jsx
│   │   │   └── VendorDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── scripts/
│   │   ├── init-db.js
│   │   └── schema.mongodb.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── elasticsearch.js
│   │   │   ├── payment.js
│   │   │   ├── redis.js
│   │   │   └── s3.js
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── cartController.js
│   │   │   ├── couponController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   ├── reviewController.js
│   │   │   ├── searchController.js
│   │   │   └── vendorController.js
│   │   ├── db/
│   │   │   ├── initDb.js
│   │   │   └── schemas.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Coupon.js
│   │   │   ├── Order.js
│   │   │   ├── Product.js
│   │   │   ├── Review.js
│   │   │   ├── User.js
│   │   │   └── Vendor.js
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── couponRoutes.js
│   │   │   ├── invoiceRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── searchRoutes.js
│   │   │   └── vendorRoutes.js
│   │   ├── seed/
│   │   │   └── seedData.js
│   │   └── server.js
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── ARCHITECTURE.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 9 or higher)
- MongoDB instance (optional; if not running locally, the server starts an embedded in-memory database automatically)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. (Optional) Run the database-first schema initializer:
   ```bash
   npm run db:init
   ```
   *Note: If MongoDB is running on localhost:27017, this creates all 6 collections, attaches native JSON schema validation rules, and builds indexes. You can also paste `server/scripts/schema.mongodb.js` directly into MongoDB Compass.*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will start on `http://localhost:5000`. On first run, it seeds sample vendors, products, and coupons automatically.

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will start on `http://localhost:5173`.

---

## Environment Variables

A `.env.example` file is provided in the `server` directory. The defaults work out of the box for local development:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_2026_nexviamart_production_key
MONGO_URI=mongodb://localhost:27017/nexviamart_db
REDIS_URL=redis://127.0.0.1:6379
USE_REDIS_CLUSTER=false
ELASTICSEARCH_NODE=http://localhost:9200
USE_ELASTICSEARCH_CLUSTER=false
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
STRIPE_SECRET_KEY=sk_test_mock_stripe_split_key
RAZORPAY_KEY_ID=rzp_test_mock_razorpay_key
RAZORPAY_KEY_SECRET=rzp_mock_secret
```

---

## Demo Accounts

Pre-configured accounts for testing different user roles:

| Role | Email | Password | Permissions |
|---|---|---|---|
| Customer | customer@nexviamart.com | CustomerPassword123! | Browse shop, manage cart, place orders, download invoices |
| Vendor | vendor.tech@nexviamart.com | VendorPassword123! | Vendor dashboard, product CRUD, manage fulfillment |

Customer and vendor credentials can also be autofilled using demo buttons on the `/login` page. Admin accounts are confidential and restricted to authorized platform administrators.

### Sample Promo Coupons

- `WELCOME20`: 20% discount on orders over $50 (up to $50 max discount)
- `SAVE10`: 10% discount on orders over $20
- `SUPER50`: 25% discount on orders over $150

---

## API Documentation

Key backend REST API endpoints:

- `POST /api/auth/register` - Create customer or vendor account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Get current user profile
- `GET /api/products` - List products with pagination and category filters
- `GET /api/products/:id` - Get product details and reviews
- `POST /api/products` - Create new product (Vendor/Admin)
- `PUT /api/products/:id` - Update existing product (Vendor/Admin)
- `DELETE /api/products/:id` - Remove product (Vendor/Admin)
- `GET /api/search` - Search products by query, category, price, and rating
- `GET /api/cart` - Retrieve shopping cart by token or guest session
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:productId` - Remove item from cart
- `POST /api/orders` - Place multi-vendor order with split payments
- `GET /api/orders/:id` - View order details and split breakdown
- `PUT /api/orders/:id/status` - Update shipping status (Vendor/Admin)
- `GET /api/invoices/:orderId` - Download PDF tax invoice
- `GET /api/analytics/admin` - Retrieve platform revenue and GMV stats (Admin)

For full API documentation, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).
For detailed architecture flows and diagrams, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
