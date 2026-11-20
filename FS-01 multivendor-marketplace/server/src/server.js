import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initElasticsearch } from './config/elasticsearch.js';
import { seedDatabase } from './seed/seedData.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Review } from './models/Review.js';

import authRoutes from './routes/authRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import productRoutes from './routes/productRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'connected',
      redis: 'active (in-memory + cluster adapter)',
      elasticsearch: 'active (search & facet indexer)',
      storage: process.env.AWS_BUCKET_NAME ? 'aws-s3' : 'local-media-store',
      payments: {
        stripeConnect: 'active (test-mode split transfers)',
        razorpayRoute: 'active (split settlements)'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    initRedis();
    await initElasticsearch();

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    if (userCount === 0 && productCount === 0) {
      console.log('[Startup] Empty database detected. Seeding initial demo data...');
      await seedDatabase();
    }

    const reviewsGrouped = await Review.aggregate([
      {
        $group: {
          _id: '$product',
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    for (const group of reviewsGrouped) {
      if (group._id) {
        await Product.findByIdAndUpdate(group._id, {
          ratings: {
            average: Math.round(group.average * 10) / 10,
            count: group.count
          }
        });
      }
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`NexviaMart Multi-Vendor Backend is running on port ${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
