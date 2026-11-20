use('nexviamart_db');

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
        password: { bsonType: 'string', minLength: 6 },
        role: { enum: ['customer', 'vendor', 'admin'] },
        avatar: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        addresses: { bsonType: 'array' },
        vendorProfile: { bsonType: ['objectId', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.users.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email_unique' });
db.users.createIndex({ role: 1 }, { name: 'idx_users_role' });

db.createCollection('vendors', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user', 'storeName', 'commissionRate'],
      properties: {
        _id: { bsonType: 'objectId' },
        user: { bsonType: 'objectId' },
        storeName: { bsonType: 'string' },
        storeSlug: { bsonType: 'string' },
        description: { bsonType: 'string' },
        logo: { bsonType: 'string' },
        banner: { bsonType: 'string' },
        status: { enum: ['pending', 'approved', 'suspended'] },
        commissionRate: { bsonType: 'number', minimum: 0, maximum: 50 },
        stripeAccountId: { bsonType: 'string' },
        razorpayAccountId: { bsonType: 'string' },
        bankDetails: { bsonType: 'object' },
        metrics: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.vendors.createIndex({ user: 1 }, { unique: true, name: 'idx_vendors_user_unique' });
db.vendors.createIndex({ storeName: 1 }, { unique: true, name: 'idx_vendors_storename_unique' });
db.vendors.createIndex({ storeSlug: 1 }, { unique: true, sparse: true, name: 'idx_vendors_storeslug_unique' });

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['vendor', 'name', 'description', 'price', 'category', 'stock'],
      properties: {
        _id: { bsonType: 'objectId' },
        vendor: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        slug: { bsonType: 'string' },
        description: { bsonType: 'string' },
        price: { bsonType: 'number', minimum: 0 },
        compareAtPrice: { bsonType: 'number' },
        category: { bsonType: 'string' },
        brand: { bsonType: 'string' },
        sku: { bsonType: 'string' },
        stock: { bsonType: 'number', minimum: 0 },
        images: { bsonType: 'array' },
        tags: { bsonType: 'array' },
        ratings: { bsonType: 'object' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.products.createIndex({ vendor: 1 }, { name: 'idx_products_vendor' });
db.products.createIndex({ category: 1, price: 1 }, { name: 'idx_products_category_price' });
db.products.createIndex({ price: 1 }, { name: 'idx_products_price' });
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' }, { name: 'idx_products_text_search' });

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customer', 'orderNumber', 'items', 'shippingAddress', 'payment', 'subtotal', 'totalAmount', 'orderStatus'],
      properties: {
        _id: { bsonType: 'objectId' },
        customer: { bsonType: 'objectId' },
        orderNumber: { bsonType: 'string' },
        items: { bsonType: 'array' },
        shippingAddress: { bsonType: 'object' },
        payment: { bsonType: 'object' },
        subtotal: { bsonType: 'number' },
        discount: { bsonType: 'number' },
        couponApplied: { bsonType: ['object', 'null'] },
        tax: { bsonType: 'number' },
        shippingFee: { bsonType: 'number' },
        totalAmount: { bsonType: 'number' },
        platformTotalCommission: { bsonType: 'number' },
        vendorTotalPayout: { bsonType: 'number' },
        orderStatus: { enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'] },
        timeline: { bsonType: 'array' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.orders.createIndex({ orderNumber: 1 }, { unique: true, name: 'idx_orders_ordernumber_unique' });
db.orders.createIndex({ customer: 1 }, { name: 'idx_orders_customer' });
db.orders.createIndex({ orderStatus: 1 }, { name: 'idx_orders_status' });
db.orders.createIndex({ createdAt: -1 }, { name: 'idx_orders_created_desc' });

db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['product', 'customer', 'rating', 'title', 'comment'],
      properties: {
        _id: { bsonType: 'objectId' },
        product: { bsonType: 'objectId' },
        customer: { bsonType: 'objectId' },
        rating: { bsonType: 'number', minimum: 1, maximum: 5 },
        title: { bsonType: 'string' },
        comment: { bsonType: 'string' },
        verifiedPurchase: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.reviews.createIndex({ product: 1, customer: 1 }, { unique: true, name: 'idx_reviews_product_customer_unique' });
db.reviews.createIndex({ product: 1, rating: -1 }, { name: 'idx_reviews_product_rating' });

db.createCollection('coupons', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['code', 'discountPercent', 'isActive'],
      properties: {
        _id: { bsonType: 'objectId' },
        code: { bsonType: 'string' },
        discountPercent: { bsonType: 'number', minimum: 1, maximum: 90 },
        maxDiscount: { bsonType: 'number' },
        minOrderAmount: { bsonType: 'number' },
        expiryDate: { bsonType: 'date' },
        isActive: { bsonType: 'bool' },
        usageLimit: { bsonType: 'number' },
        timesUsed: { bsonType: 'number' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});
db.coupons.createIndex({ code: 1 }, { unique: true, name: 'idx_coupons_code_unique' });
db.coupons.createIndex({ isActive: 1 }, { name: 'idx_coupons_isactive' });

print('DB-First schema initialization completed successfully.');
