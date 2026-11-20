# NexviaMart Multi-Vendor Architecture & Data Design

## 1. Executive System Overview
NexviaMart is an enterprise-grade multi-vendor e-commerce platform designed with an Amazon-style architecture. The system decouples customer shopping, vendor catalog administration, and platform governance while automating real-time payment splitting, platform commission retention, and order fulfillment tracking.

```mermaid
flowchart TD
    Client["React 18 + Tailwind Client (Vite)"]
    Gateway["Node.js / Express API Gateway"]
    
    subgraph Services ["Backend Application Layer"]
        AuthSvc["Auth & RBAC Service (JWT)"]
        SearchSvc["Elasticsearch Search & Facet Engine"]
        CartSvc["Redis Cart & Session Caching"]
        PaymentSvc["Split Payment Engine (Stripe / Razorpay)"]
        OrderSvc["Lifecycle State Machine"]
        MediaSvc["AWS S3 Cloud Media Pipeline"]
        InvoiceSvc["jsPDF Vector Invoice Engine"]
        MongooseSvc["Mongoose ODM Data Layer"]
    end

    subgraph Storage ["Data & Storage Layer"]
        MongoDB[("MongoDB Database Cluster")]
        RedisCache[("Redis Cache (7-Day TTL)")]
        ElasticIndex[("Elasticsearch Inverted Index")]
        S3Bucket[("AWS S3 Asset Bucket")]
    end

    Client -->|REST & JSON API| Gateway
    Gateway --> AuthSvc
    Gateway --> SearchSvc
    Gateway --> CartSvc
    Gateway --> PaymentSvc
    Gateway --> OrderSvc
    Gateway --> MediaSvc
    Gateway --> InvoiceSvc
    AuthSvc --> MongooseSvc
    OrderSvc --> MongooseSvc
    MongooseSvc --> MongoDB
    SearchSvc --> ElasticIndex
    CartSvc --> RedisCache
    MediaSvc --> S3Bucket
```

---

## 2. Database-First (DB-First) Architecture & Relational Data Schema

The data layer is built using a **Database-First (DB-First)** paradigm:

1. **Database as Single Source of Truth:**
   - The native database schema is defined as MongoDB DDL commands and `$jsonSchema` validators in [`server/src/db/schemas.js`](../server/src/db/schemas.js) and [`server/scripts/schema.mongodb.js`](../server/scripts/schema.mongodb.js).
   - Collections, validators, and native indexes (unique constraints, compound indexes, text search) are created directly at the database engine level via `db.createCollection(name, { validator: spec.validator })`.
   - Native schema migration can be executed anytime via:
     ```bash
     cd server
     npm run db:init
     ```
   - Or open [`server/scripts/schema.mongodb.js`](../server/scripts/schema.mongodb.js) directly inside MongoDB Compass `_mongosh`.

2. **Application Layer Integration:**
   - Mongoose models operate in DB-First mode (`autoCreate: false`, `autoIndex: false`), consuming the existing database structure rather than driving it lazily.
   - Pre-save hooks automatically hash user passwords using BCrypt and generate URL-safe slugs for vendor storefronts and products.
   - Instance methods like `comparePassword` encapsulate authentication logic directly on user documents.

```mermaid
erDiagram
    USER ||--o{ VENDOR : owns
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    VENDOR ||--o{ PRODUCT : publishes
    VENDOR ||--o{ ORDER_ITEM : fulfills
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o| COUPON : applies
    PRODUCT ||--o{ REVIEW : receives

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "customer | vendor | admin"
        string avatar
        array addresses
    }

    VENDOR {
        ObjectId _id PK
        ObjectId user FK
        string storeName UK
        string storeSlug UK
        number commissionRate "Default 10%"
        string stripeAccountId
        string razorpayAccountId
        number balance
        number totalSales
        number totalEarnings
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId vendor FK
        string name
        string slug
        string description
        number price
        number compareAtPrice
        string category
        string brand
        number stock
        array images
        array tags
        object ratings
    }

    ORDER {
        ObjectId _id PK
        ObjectId customer FK
        string orderNumber UK
        number subtotal
        number discount
        number tax
        number shippingFee
        number totalAmount
        number platformTotalCommission
        number vendorTotalPayout
        string orderStatus "placed | packed | shipped | delivered"
        array timeline
    }

    ORDER_ITEM {
        ObjectId product FK
        ObjectId vendor FK
        string name
        number price
        number quantity
        number itemTotal
        number vendorEarnings
        number platformCommission
        string itemStatus
    }
```

---

## 3. Split Payment & Commission Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as React Client
    participant Server as Express Server
    participant Payment as Stripe Connect / Razorpay Route
    participant DB as MongoDB
    actor Vendor

    Customer->>Frontend: Place Order & Authorize Payment
    Frontend->>Server: POST /api/orders (items, address, gateway)
    Server->>Server: Compute subtotal, tax, and multi-vendor splits
    Server->>Payment: Execute Destination Charge / Split Transfer
    Payment-->>Server: Return Transaction ID & Transfer Receipts
    Server->>DB: Atomically deduct product stock
    Server->>DB: Credit vendor account balance
    Server->>DB: Save Order with 'placed' status & timeline log
    Server-->>Frontend: 201 Created (Order Confirmation & Split Details)
    Frontend-->>Customer: Trigger Confetti & Redirect to Order Tracking
    Note over Vendor,Server: Vendor fulfills items and advances order state
    Vendor->>Server: PUT /api/orders/:id/status (packed -> shipped)
```

---

## 4. Key Performance Architectural Decisions
1. **Clean Mongoose ODM Modeling:** Schemas define strict validation, defaults, and relations without unnecessary DDL boilerplate, making the codebase maintainable and readable.
2. **Elasticsearch Faceted Querying:** Offloads intensive full-text search, spelling fuzzy matches, and category aggregations from MongoDB to an inverted index, ensuring sub-50ms response times.
3. **Redis Session & Cart Store:** Bypasses disk I/O for frequent cart reads, updates, and guest session lookups with a 7-day TTL and sub-2ms response latency.
4. **Automated Zero-Config Fallback:** For testing environments where external Redis, Elasticsearch, or AWS S3 instances are not provisioned, built-in in-memory adapters provide identical API methods, ensuring 100% test reliability.
