export const DATABASE_NAME = 'nexviamart_db';

export const collectionsSchema = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          _id: { bsonType: 'objectId' },
          name: {
            bsonType: 'string',
            description: 'Full name of user - required string'
          },
          email: {
            bsonType: 'string',
            pattern: '^\\S+@\\S+\\.\\S+$',
            description: 'Unique valid email address - required string'
          },
          password: {
            bsonType: 'string',
            minLength: 6,
            description: 'BCrypt hashed password - required string min 6 chars'
          },
          role: {
            enum: ['customer', 'vendor', 'admin'],
            description: 'Role-Based Access Control role - customer, vendor, or admin'
          },
          avatar: {
            bsonType: 'string',
            description: 'Profile avatar image URL'
          },
          phone: {
            bsonType: 'string',
            description: 'Contact phone number'
          },
          addresses: {
            bsonType: 'array',
            description: 'List of shipping addresses',
            items: {
              bsonType: 'object',
              required: ['street', 'city', 'state', 'zipCode'],
              properties: {
                street: { bsonType: 'string' },
                city: { bsonType: 'string' },
                state: { bsonType: 'string' },
                zipCode: { bsonType: 'string' },
                country: { bsonType: 'string' },
                isDefault: { bsonType: 'bool' }
              }
            }
          },
          vendorProfile: {
            bsonType: ['objectId', 'null'],
            description: 'Reference to associated Vendor document if user is a vendor'
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { email: 1 }, options: { unique: true, name: 'idx_users_email_unique' } },
      { key: { role: 1 }, options: { name: 'idx_users_role' } }
    ]
  },

  vendors: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'storeName', 'commissionRate'],
        properties: {
          _id: { bsonType: 'objectId' },
          user: {
            bsonType: 'objectId',
            description: 'User ObjectId referencing the owner - required'
          },
          storeName: {
            bsonType: 'string',
            description: 'Public merchant store name - required string'
          },
          storeSlug: {
            bsonType: 'string',
            description: 'URL-friendly store slug'
          },
          description: {
            bsonType: 'string',
            description: 'Merchant storefront description'
          },
          logo: {
            bsonType: 'string',
            description: 'Store logo image URL'
          },
          banner: {
            bsonType: 'string',
            description: 'Store banner image URL'
          },
          status: {
            enum: ['pending', 'approved', 'suspended'],
            description: 'Store operational status'
          },
          commissionRate: {
            bsonType: 'number',
            minimum: 0,
            maximum: 50,
            description: 'Platform service fee percentage (e.g. 10)'
          },
          stripeAccountId: {
            bsonType: 'string',
            description: 'Stripe Connect merchant account ID'
          },
          razorpayAccountId: {
            bsonType: 'string',
            description: 'Razorpay Route linked account ID'
          },
          bankDetails: {
            bsonType: 'object',
            properties: {
              accountHolderName: { bsonType: 'string' },
              accountNumber: { bsonType: 'string' },
              bankName: { bsonType: 'string' },
              routingNumber: { bsonType: 'string' }
            }
          },
          metrics: {
            bsonType: 'object',
            properties: {
              totalSales: { bsonType: 'number' },
              totalEarnings: { bsonType: 'number' },
              rating: { bsonType: 'number' },
              ratingCount: { bsonType: 'number' },
              productCount: { bsonType: 'number' }
            }
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { user: 1 }, options: { unique: true, name: 'idx_vendors_user_unique' } },
      { key: { storeName: 1 }, options: { unique: true, name: 'idx_vendors_storename_unique' } },
      { key: { storeSlug: 1 }, options: { unique: true, sparse: true, name: 'idx_vendors_storeslug_unique' } }
    ]
  },

  products: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['vendor', 'name', 'description', 'price', 'category', 'stock'],
        properties: {
          _id: { bsonType: 'objectId' },
          vendor: {
            bsonType: 'objectId',
            description: 'Reference to the publishing Vendor - required'
          },
          name: {
            bsonType: 'string',
            description: 'Product title - required'
          },
          slug: {
            bsonType: 'string',
            description: 'Product URL slug'
          },
          description: {
            bsonType: 'string',
            description: 'Detailed product description - required'
          },
          price: {
            bsonType: 'number',
            minimum: 0,
            description: 'Retail selling price - required non-negative number'
          },
          compareAtPrice: {
            bsonType: 'number',
            description: 'Original MSRP / compare price'
          },
          category: {
            bsonType: 'string',
            description: 'Category name - required'
          },
          brand: {
            bsonType: 'string',
            description: 'Brand or manufacturer name'
          },
          sku: {
            bsonType: 'string',
            description: 'Stock Keeping Unit identifier'
          },
          stock: {
            bsonType: 'number',
            minimum: 0,
            description: 'Available inventory units - required non-negative number'
          },
          images: {
            bsonType: 'array',
            description: 'Array of S3 or hosted image URLs',
            items: { bsonType: 'string' }
          },
          tags: {
            bsonType: 'array',
            description: 'Search keyword tags',
            items: { bsonType: 'string' }
          },
          ratings: {
            bsonType: 'object',
            properties: {
              average: { bsonType: 'number' },
              count: { bsonType: 'number' }
            }
          },
          isActive: {
            bsonType: 'bool',
            description: 'Product visibility flag'
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { vendor: 1 }, options: { name: 'idx_products_vendor' } },
      { key: { category: 1, price: 1 }, options: { name: 'idx_products_category_price' } },
      { key: { price: 1 }, options: { name: 'idx_products_price' } },
      { key: { name: 'text', description: 'text', tags: 'text' }, options: { name: 'idx_products_text_search' } }
    ]
  },

  orders: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['customer', 'orderNumber', 'items', 'shippingAddress', 'payment', 'subtotal', 'totalAmount', 'orderStatus'],
        properties: {
          _id: { bsonType: 'objectId' },
          customer: {
            bsonType: 'objectId',
            description: 'Customer User ObjectId - required'
          },
          orderNumber: {
            bsonType: 'string',
            description: 'Unique human-readable order number (e.g. ORD-2026-XXXX) - required'
          },
          items: {
            bsonType: 'array',
            description: 'Array of purchased items with vendor split calculations - required',
            items: {
              bsonType: 'object',
              required: ['product', 'vendor', 'name', 'price', 'quantity', 'itemTotal', 'vendorEarnings', 'platformCommission'],
              properties: {
                product: { bsonType: 'objectId' },
                vendor: { bsonType: 'objectId' },
                name: { bsonType: 'string' },
                image: { bsonType: 'string' },
                price: { bsonType: 'number' },
                quantity: { bsonType: 'number', minimum: 1 },
                itemTotal: { bsonType: 'number' },
                vendorEarnings: { bsonType: 'number' },
                platformCommission: { bsonType: 'number' },
                itemStatus: {
                  enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled']
                }
              }
            }
          },
          shippingAddress: {
            bsonType: 'object',
            required: ['fullName', 'street', 'city', 'state', 'zipCode'],
            properties: {
              fullName: { bsonType: 'string' },
              street: { bsonType: 'string' },
              city: { bsonType: 'string' },
              state: { bsonType: 'string' },
              zipCode: { bsonType: 'string' },
              country: { bsonType: 'string' },
              phone: { bsonType: 'string' }
            }
          },
          payment: {
            bsonType: 'object',
            required: ['gateway', 'status'],
            properties: {
              gateway: { bsonType: 'string' },
              transactionId: { bsonType: 'string' },
              status: { enum: ['pending', 'completed', 'failed', 'refunded'] },
              splitDetails: { bsonType: 'array' },
              paidAt: { bsonType: 'date' }
            }
          },
          subtotal: { bsonType: 'number' },
          discount: { bsonType: 'number' },
          couponApplied: {
            bsonType: ['object', 'null'],
            properties: {
              code: { bsonType: 'string' },
              discountAmount: { bsonType: 'number' }
            }
          },
          tax: { bsonType: 'number' },
          shippingFee: { bsonType: 'number' },
          totalAmount: { bsonType: 'number' },
          platformTotalCommission: { bsonType: 'number' },
          vendorTotalPayout: { bsonType: 'number' },
          orderStatus: {
            enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
            description: 'Fulfillment milestone - required'
          },
          timeline: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['status'],
              properties: {
                status: { enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'] },
                timestamp: { bsonType: 'date' },
                note: { bsonType: 'string' }
              }
            }
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { orderNumber: 1 }, options: { unique: true, name: 'idx_orders_ordernumber_unique' } },
      { key: { customer: 1 }, options: { name: 'idx_orders_customer' } },
      { key: { orderStatus: 1 }, options: { name: 'idx_orders_status' } },
      { key: { createdAt: -1 }, options: { name: 'idx_orders_created_desc' } }
    ]
  },

  reviews: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['product', 'customer', 'rating', 'title', 'comment'],
        properties: {
          _id: { bsonType: 'objectId' },
          product: { bsonType: 'objectId', description: 'Product ObjectId - required' },
          customer: { bsonType: 'objectId', description: 'Customer User ObjectId - required' },
          rating: {
            bsonType: 'number',
            minimum: 1,
            maximum: 5,
            description: 'Rating integer between 1 and 5 - required'
          },
          title: { bsonType: 'string', description: 'Review summary title - required' },
          comment: { bsonType: 'string', description: 'Full review commentary - required' },
          verifiedPurchase: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    },
    indexes: [
      { key: { product: 1, customer: 1 }, options: { unique: true, name: 'idx_reviews_product_customer_unique' } },
      { key: { product: 1, rating: -1 }, options: { name: 'idx_reviews_product_rating' } }
    ]
  },

  coupons: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'discountPercent', 'isActive'],
        properties: {
          _id: { bsonType: 'objectId' },
          code: {
            bsonType: 'string',
            description: 'Uppercase promo coupon code - required'
          },
          discountPercent: {
            bsonType: 'number',
            minimum: 1,
            maximum: 90,
            description: 'Discount percentage - required'
          },
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
    indexes: [
      { key: { code: 1 }, options: { unique: true, name: 'idx_coupons_code_unique' } },
      { key: { isActive: 1 }, options: { name: 'idx_coupons_isactive' } }
    ]
  }
};
