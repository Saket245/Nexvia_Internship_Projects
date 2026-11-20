import { Router } from 'express';
import { isDbConnected } from '../../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const dbStatus = await isDbConnected();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      provider: 'postgresql',
      connected: dbStatus,
      status: dbStatus ? 'healthy' : 'disconnected (in-memory fallback active)',
    },
    memory: process.memoryUsage(),
    version: '1.0.0',
  });
});
