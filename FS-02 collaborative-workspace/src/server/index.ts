import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { documentsRouter } from './routes/documents';
import { canvasesRouter } from './routes/canvases';
import { workspacesRouter } from './routes/workspaces';
import { activitiesRouter } from './routes/activities';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocketServer } from './websocket';
import { isDbConnected } from '../lib/prisma';
import {
  getComments,
  addComment,
  resolveComment,
  getVersionSnapshots,
  createVersionSnapshot,
} from '../lib/storage';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 1234;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/canvases', canvasesRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/activities', activitiesRouter);

app.get('/api/comments', async (req, res, next) => {
  try {
    const targetId = String(req.query.targetId || '');
    const comments = await getComments(targetId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

app.post('/api/comments', async (req, res, next) => {
  try {
    const { targetId, targetType, authorId, authorName, authorColor, content } = req.body;
    if (!targetId || !content) {
      return res.status(400).json({ error: 'Missing targetId or content' });
    }
    const comment = await addComment({
      targetId,
      targetType: targetType || 'DOCUMENT',
      authorId: authorId || 'user-1',
      authorName: authorName || 'Anonymous',
      authorColor: authorColor || '#6366f1',
      content,
      resolved: false,
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

app.patch('/api/comments/:id/resolve', async (req, res, next) => {
  try {
    const success = await resolveComment(req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

app.get('/api/versions', async (req, res, next) => {
  try {
    const targetId = String(req.query.targetId || '');
    const snapshots = await getVersionSnapshots(targetId);
    res.json(snapshots);
  } catch (err) {
    next(err);
  }
});

app.post('/api/versions', async (req, res, next) => {
  try {
    const { targetId, targetType, title, authorName, snapshotData } = req.body;
    if (!targetId || !snapshotData) {
      return res.status(400).json({ error: 'Missing targetId or snapshotData' });
    }
    const snapshot = await createVersionSnapshot({
      targetId,
      targetType: targetType || 'DOCUMENT',
      title: title || 'Milestone Snapshot',
      authorName: authorName || 'Anonymous',
      snapshotData,
    });
    res.status(201).json(snapshot);
  } catch (err) {
    next(err);
  }
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Real-Time Collaborative Workspace API',
    techStack: [
      'React',
      'TypeScript',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Prisma',
      'Zod',
      'Docker'
    ],
    approach: 'Database-First',
    endpoints: {
      health: '/api/health',
      documents: '/api/documents',
      canvases: '/api/canvases',
      workspaces: '/api/workspaces/default',
      activities: '/api/activities',
    },
    websockets: {
      path: '/ws',
      standalonePort: WS_PORT,
    },
  });
});

const rootProjectDir = path.resolve(__dirname, '../..');
const publicDir = path.join(rootProjectDir, 'public');
const clientBuildDir = path.join(rootProjectDir, 'dist');
const indexHtml = path.join(clientBuildDir, 'index.html');

if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
}
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

app.use(errorHandler);

setupWebSocketServer(server);

try {
  setupWebSocketServer(server, WS_PORT);
} catch (e) {
  console.log('[WebSocket] Primary WS attached to HTTP server.');
}

server.on('error', (err: any) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`[Server] Port ${PORT} already bound, running alongside active instance.`);
  } else {
    console.error('[Server] Error:', err);
  }
});

server.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 Node.js + Express API Server running on port ${PORT}`);
  console.log(`⚡ Real-Time WebSocket Server active on port ${WS_PORT} and /ws`);
  console.log(`🛠️ Tech Stack: React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Zod, Docker`);
  console.log(`💾 Architecture: Database-First (PostgreSQL DDL + Prisma Introspection)`);
  console.log('====================================================');

  const dbOk = await isDbConnected();
  if (dbOk) {
    console.log('✅ PostgreSQL Database connection: ACTIVE');
  } else {
    console.log('ℹ️ PostgreSQL not reachable yet. In-Memory fallback store: ACTIVE (zero-friction dev)');
  }
});

export { app, server };
