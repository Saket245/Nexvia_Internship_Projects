import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initDatabase } from '../db/initDb.js';

let mongod = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexviamart_db';
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    await initDatabase(conn.connection.db);
    return conn;
  } catch (error) {
    console.log(`[MongoDB] Local daemon not reachable: ${error.message}`);
    console.log('[MongoDB] Starting embedded MongoDB memory server fallback...');
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to embedded in-memory MongoDB: ${uri}`);
      await initDatabase(conn.connection.db);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Embedded fallback failed: ${memErr.message}`);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
