import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initDatabase } from '../src/db/initDb.js';
import { DATABASE_NAME } from '../src/db/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runInit = async () => {
  const uri = process.env.MONGO_URI || `mongodb://localhost:27017/${DATABASE_NAME}`;

  console.log(`=======================================================`);
  console.log(`[DB-First Deployment] Target URI: ${uri}`);
  console.log(`=======================================================`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`[DB-First] Successfully connected to MongoDB host: ${conn.connection.host}`);
    await initDatabase(conn.connection.db);

    console.log(`\n=======================================================`);
    console.log(`[DB-First] SUCCESS: Database '${conn.connection.db.databaseName}' is now fully initialized!`);
    console.log(`Open MongoDB Compass -> connect to localhost:27017 -> Refresh`);
    console.log(`You will see:`);
    console.log(`  - Database: ${conn.connection.db.databaseName}`);
    console.log(`  - Collections: users, vendors, products, orders, reviews, coupons`);
    console.log(`  - Native JSON Schema Validation rules & indexes attached.`);
    console.log(`=======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`\n[DB-First] Error: Could not connect to MongoDB at ${uri}.`);
    console.error(`Reason: ${error.message}`);
    console.error(`\nMake sure your local MongoDB service is running (e.g. 'net start MongoDB' or MongoDB Compass).`);
    process.exit(1);
  }
};

runInit();
