import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from '../config/db.js';
import { initRedis } from '../config/redis.js';
import { getSearchEngine } from '../config/elasticsearch.js';

import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Coupon } from '../models/Coupon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Seeding database with production demo data...');



    const adminUser = await User.create({
      name: 'NexviaMart Chief Administrator',
      email: 'admin@nexviamart.com',
      password: 'AdminPassword123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      phone: '+1 (555) 019-2834',
      addresses: [{
        street: '100 Marketplace HQ Way',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
        isDefault: true
      }]
    });

    const vendorTechUser = await User.create({
      name: 'TechNova Global',
      email: 'vendor.tech@nexviamart.com',
      password: 'VendorPassword123!',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    });

    const vendorTech = await Vendor.create({
      user: vendorTechUser._id,
      storeName: 'TechNova Global Solutions',
      description: 'Authorized retailer for next-generation consumer audio, computing, and smart home electronics.',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      commissionRate: 8, 
      stripeAccountId: 'acct_1TechNovaStripeConnect',
      razorpayAccountId: 'acc_1TechNovaRazorpayRoute',
      status: 'approved',
      rating: 4.9,
      ratingCount: 328
    });
    await User.findByIdAndUpdate(vendorTechUser._id, { vendorProfile: vendorTech._id });

    const vendorFashionUser = await User.create({
      name: 'Aurelia Studio',
      email: 'vendor.fashion@nexviamart.com',
      password: 'VendorPassword123!',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
    });

    const vendorFashion = await Vendor.create({
      user: vendorFashionUser._id,
      storeName: 'Aurelia Luxury Apparel',
      description: 'Handcrafted sustainable streetwear, organic cotton essentials, and tailored artisan jackets.',
      logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      commissionRate: 12, 
      stripeAccountId: 'acct_2AureliaStripeConnect',
      razorpayAccountId: 'acc_2AureliaRazorpayRoute',
      status: 'approved',
      rating: 4.8,
      ratingCount: 194
    });
    await User.findByIdAndUpdate(vendorFashionUser._id, { vendorProfile: vendorFashion._id });

    const vendorHomeUser = await User.create({
      name: 'Artisan Wood & Living',
      email: 'vendor.home@nexviamart.com',
      password: 'VendorPassword123!',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    });

    const vendorHome = await Vendor.create({
      user: vendorHomeUser._id,
      storeName: 'Artisan Living Co.',
      description: 'Minimalist Scandinavian furniture, ergonomic desks, ceramic cookware, and aesthetic lighting.',
      logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      commissionRate: 10,
      stripeAccountId: 'acct_3ArtisanStripeConnect',
      razorpayAccountId: 'acc_3ArtisanRazorpayRoute',
      status: 'approved',
      rating: 4.7,
      ratingCount: 142
    });
    await User.findByIdAndUpdate(vendorHomeUser._id, { vendorProfile: vendorHome._id });

    const customerUser = await User.create({
      name: 'Alex Rivera',
      email: 'customer@nexviamart.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      phone: '+1 (555) 789-4321',
      addresses: [{
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477',
        country: 'USA',
        isDefault: true
      }]
    });

    const productsData = [
      {
        vendor: vendorTech._id,
        name: 'SonicPro Ultra Noise-Cancelling Wireless Headphones',
        description: 'Engineered with 40mm beryllium drivers, 45 hours battery life, multipoint Bluetooth 5.4, and hybrid active noise cancellation for studio-grade acoustic precision.',
        price: 279.99,
        compareAtPrice: 349.99,
        category: 'Electronics',
        brand: 'SoundMaster',
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['headphones', 'bluetooth', 'audio', 'noise cancelling', 'electronics'],
        ratings: { average: 4.9, count: 87 }
      },
      {
        vendor: vendorTech._id,
        name: 'Apex Mechanical Gaming Keyboard RGB (Tactile Brown)',
        description: 'Aircraft-grade anodized aluminum frame, per-key RGB backlighting, hot-swappable tactile switches, and dedicated programmable macro keys.',
        price: 139.50,
        compareAtPrice: 179.00,
        category: 'Electronics',
        brand: 'ApexGear',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['keyboard', 'gaming', 'rgb', 'mechanical', 'electronics'],
        ratings: { average: 4.8, count: 64 }
      },
      {
        vendor: vendorTech._id,
        name: 'Quantum 4K Ultra-Wide 34-Inch Curved Monitor (165Hz)',
        description: 'IPS quantum dot display with 1ms response time, HDR 600, 98% DCI-P3 color gamut, and integrated USB-C 90W power delivery for productivity and gaming.',
        price: 649.00,
        compareAtPrice: 799.00,
        category: 'Electronics',
        brand: 'QuantumView',
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['monitor', 'curved', '4k', 'gaming', 'ultrawide'],
        ratings: { average: 4.7, count: 42 }
      },
      {
        vendor: vendorFashion._id,
        name: 'Classic Highland Merino Wool Oversized Trench Coat',
        description: 'Crafted from 100% ethically sourced Scottish Merino wool. Features double-breasted horn buttons, storm flaps, and a water-resistant finish.',
        price: 245.00,
        compareAtPrice: 320.00,
        category: 'Fashion',
        brand: 'Aurelia',
        stock: 24,
        images: [
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['jacket', 'coat', 'wool', 'winter', 'fashion'],
        ratings: { average: 4.9, count: 53 }
      },
      {
        vendor: vendorFashion._id,
        name: 'Artisan Full-Grain Leather Weekender Duffle Bag',
        description: 'Vegetable-tanned Italian leather with heavy-duty brass zippers, reinforced canvas lining, and separate shoe compartment.',
        price: 189.95,
        compareAtPrice: 229.00,
        category: 'Fashion',
        brand: 'Aurelia',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['bag', 'leather', 'travel', 'duffle', 'accessories'],
        ratings: { average: 4.8, count: 71 }
      },
      {
        vendor: vendorFashion._id,
        name: 'Handcrafted Heritage Minimalist Chronograph Watch',
        description: 'Japanese Miyota movement, sapphire crystal scratch-resistant glass, 5ATM water resistance, and interchangeable genuine Horween leather strap.',
        price: 165.00,
        compareAtPrice: 210.00,
        category: 'Fashion',
        brand: 'Chronos',
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['watch', 'chronograph', 'leather', 'luxury', 'fashion'],
        ratings: { average: 4.7, count: 39 }
      },
      {
        vendor: vendorHome._id,
        name: 'Solid Walnut Mid-Century Modern Ergonomic Desk',
        description: 'Sustainably harvested American walnut with chamfered edges, integrated hidden cable organizer, and powder-coated steel matte black legs.',
        price: 489.00,
        compareAtPrice: 599.00,
        category: 'Home & Kitchen',
        brand: 'Artisan Living',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['desk', 'furniture', 'wood', 'home office', 'minimalist'],
        ratings: { average: 4.9, count: 31 }
      },
      {
        vendor: vendorHome._id,
        name: 'Barista Touch Precision Espresso Machine with Grinder',
        description: '15-bar Italian pump with PID temperature control, integrated conical burr grinder with 30 grind settings, and microfoam steam wand.',
        price: 399.99,
        compareAtPrice: 499.99,
        category: 'Home & Kitchen',
        brand: 'CafféVero',
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['coffee', 'espresso', 'kitchen', 'appliances'],
        ratings: { average: 4.8, count: 95 }
      },
      {
        vendor: vendorHome._id,
        name: 'Cast Iron Enameled Dutch Oven with Self-Basting Lid (6 Qt)',
        description: 'Multi-layer enamel coating resistant to dulling and chipping. Superior heat distribution and retention for stews, braises, and sourdough baking.',
        price: 89.95,
        compareAtPrice: 120.00,
        category: 'Home & Kitchen',
        brand: 'Artisan Living',
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1584990347449-39908cf7b31d?auto=format&fit=crop&w=800&q=80'
        ],
        tags: ['cookware', 'kitchen', 'dutch oven', 'cast iron'],
        ratings: { average: 4.9, count: 112 }
      }
    ];

    const createdProducts = await Product.insertMany(productsData);

    const searchEngine = getSearchEngine();
    await searchEngine.bulkIndex(createdProducts.map((p) => {
      const vendorRef = p.vendor.toString() === vendorTech._id.toString()
        ? vendorTech
        : p.vendor.toString() === vendorFashion._id.toString()
        ? vendorFashion
        : vendorHome;

      return {
        id: p._id.toString(),
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        images: p.images,
        tags: p.tags,
        ratings: p.ratings,
        vendor: {
          _id: vendorRef._id,
          storeName: vendorRef.storeName
        },
        createdAt: p.createdAt
      };
    }));

    await Coupon.create([
      {
        code: 'WELCOME20',
        discountPercent: 20,
        maxDiscount: 50,
        minOrderAmount: 50,
        isActive: true
      },
      {
        code: 'SAVE10',
        discountPercent: 10,
        maxDiscount: 100,
        minOrderAmount: 20,
        isActive: true
      },
      {
        code: 'SUPER50',
        discountPercent: 25,
        maxDiscount: 100,
        minOrderAmount: 150,
        isActive: true
      }
    ]);

    const orderItem1 = createdProducts[0]; 
    const orderItem2 = createdProducts[3]; 

    const item1Gross = orderItem1.price * 1;
    const item1Comm = Math.round(item1Gross * 0.08 * 100) / 100;
    const item1Net = Math.round((item1Gross - item1Comm) * 100) / 100;

    const item2Gross = orderItem2.price * 1;
    const item2Comm = Math.round(item2Gross * 0.12 * 100) / 100;
    const item2Net = Math.round((item2Gross - item2Comm) * 100) / 100;

    const subtotal = item1Gross + item2Gross;
    const discount = 20.00; 
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const shippingFee = 0; 
    const totalAmount = Math.round((subtotal - discount + tax + shippingFee) * 100) / 100;

    await Order.create({
      customer: customerUser._id,
      orderNumber: 'ORD-849201-TECH',
      items: [
        {
          product: orderItem1._id,
          vendor: vendorTech._id,
          name: orderItem1.name,
          image: orderItem1.images[0],
          price: orderItem1.price,
          quantity: 1,
          itemTotal: item1Gross,
          vendorEarnings: item1Net,
          platformCommission: item1Comm,
          itemStatus: 'shipped'
        },
        {
          product: orderItem2._id,
          vendor: vendorFashion._id,
          name: orderItem2.name,
          image: orderItem2.images[0],
          price: orderItem2.price,
          quantity: 1,
          itemTotal: item2Gross,
          vendorEarnings: item2Net,
          platformCommission: item2Comm,
          itemStatus: 'packed'
        }
      ],
      shippingAddress: {
        fullName: 'Alex Rivera',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477',
        country: 'USA',
        phone: '+1 (555) 789-4321'
      },
      subtotal,
      discount,
      tax,
      shippingFee,
      totalAmount,
      platformTotalCommission: item1Comm + item2Comm,
      vendorTotalPayout: item1Net + item2Net,
      couponApplied: {
        code: 'WELCOME20',
        discountPercent: 20,
        discountAmount: discount
      },
      payment: {
        gateway: 'stripe',
        status: 'completed',
        transactionId: 'pi_test_3N82b9Lk9sK9jW0aQ1',
        splitDetails: [
          {
            vendorId: vendorTech._id,
            storeName: vendorTech.storeName,
            grossSales: item1Gross,
            platformCommission: item1Comm,
            netPayout: item1Net,
            transferId: 'tr_test_9012398401',
            status: 'transferred'
          },
          {
            vendorId: vendorFashion._id,
            storeName: vendorFashion.storeName,
            grossSales: item2Gross,
            platformCommission: item2Comm,
            netPayout: item2Net,
            transferId: 'tr_test_4810294812',
            status: 'transferred'
          }
        ]
      },
      orderStatus: 'shipped',
      timeline: [
        {
          status: 'placed',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
          note: 'Order confirmed and payment split processed via Stripe Connect'
        },
        {
          status: 'packed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          note: 'Items boxed and verified by vendors TechNova and Aurelia'
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
          note: 'Dispatched via Express Courier. Tracking ID: TRK-992018471'
        }
      ],
      invoiceNumber: 'INV-ORD-849201-TECH'
    });

    await Review.create([
      {
        product: createdProducts[0]._id,
        customer: customerUser._id,
        rating: 5,
        title: 'Outstanding Sound Quality and Active Noise Cancellation!',
        comment: 'The noise cancellation completely shuts out airplane cabin drone. Comfort is top notch even during 8 hour flights.',
        verifiedPurchase: true
      },
      {
        product: createdProducts[1]._id,
        customer: customerUser._id,
        rating: 5,
        title: 'Crisp mechanical feel with lovely illumination',
        comment: 'Tactile brown switches provide the perfect typing feedback without being obnoxiously loud on Zoom calls.',
        verifiedPurchase: true
      }
    ]);

    console.log('[Seed] Database successfully seeded with products, vendors, coupons, and orders!');
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    throw error;
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    initRedis();
    await seedDatabase();
    process.exit(0);
  })();
}
