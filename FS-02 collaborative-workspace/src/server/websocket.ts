import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import Redis from 'ioredis';
import { WsMessageSchema } from '../schemas/collab.schema';

let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redisPub = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redisSub = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redisPub.on('error', () => {});
    redisSub.on('error', () => {});
    redisPub.connect().catch(() => {});
    redisSub.connect().catch(() => {});
  } catch (e) {}
}

interface ClientConnection {
  ws: WebSocket;
  roomName: string;
  userId?: string;
  userName?: string;
  userColor?: string;
}

class CollaborativeRoom {
  name: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Set<WebSocket>;

  constructor(name: string) {
    this.name = name;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
    this.clients = new Set();

    
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 0); 
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      this.clients.forEach((client) => {
        if (client !== origin && client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (e) {
            console.error('[WS] Send error on update:', e);
          }
        }
      });

      if (origin !== 'redis' && redisPub && redisPub.status === 'ready') {
        const payload = Buffer.from(update).toString('base64');
        redisPub.publish(`collab:rooms:${this.name}`, payload).catch(() => {});
      }
    });

    if (redisSub) {
      redisSub.subscribe(`collab:rooms:${this.name}`).catch(() => {});
      redisSub.on('message', (channel, msg) => {
        if (channel === `collab:rooms:${this.name}`) {
          const update = new Uint8Array(Buffer.from(msg, 'base64'));
          Y.applyUpdate(this.doc, update, 'redis');
        }
      });
    }

    
    this.awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 1); 
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      this.clients.forEach((client) => {
        if (client !== origin && client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
          } catch (e) {
            console.error('[WS] Send error on awareness:', e);
          }
        }
      });
    });
  }
}

export function setupWebSocketServer(httpServer: HttpServer, customPort?: number): WebSocketServer {
  const rooms = new Map<string, CollaborativeRoom>();

  const wss = customPort
    ? new WebSocketServer({ port: customPort })
    : new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.log(`[WebSocket] Port ${customPort} already bound, continuing on HTTP server /ws`);
    } else {
      console.error('[WebSocket] Server error:', err);
    }
  });

  console.log(`[WebSocket] Collaborative server listening ${customPort ? `on port ${customPort}` : 'on /ws endpoint'}`);

  wss.on('connection', (ws: WebSocket, req) => {
    
    const url = new URL(req.url || '/', 'http://localhost');
    const pathParts = url.pathname.split('/').filter(Boolean);
    const roomName = url.searchParams.get('room') || pathParts[pathParts.length - 1] || 'default-room';

    let room = rooms.get(roomName);
    if (!room) {
      room = new CollaborativeRoom(roomName);
      rooms.set(roomName, room);
    }

    room.clients.add(ws);

    
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0);
    syncProtocol.writeSyncStep1(encoder, room.doc);
    ws.send(encoding.toUint8Array(encoder));

    
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, 1);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
      try {
        if (isBinary || data instanceof Buffer || data instanceof Uint8Array) {
          const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as any);
          const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
          const decoder = decoding.createDecoder(uint8);
          const messageType = decoding.readVarUint(decoder);

          if (messageType === 0) {
            
            const replyEncoder = encoding.createEncoder();
            encoding.writeVarUint(replyEncoder, 0);
            syncProtocol.readSyncMessage(decoder, replyEncoder, room!.doc, ws);
            const replyMsg = encoding.toUint8Array(replyEncoder);
            if (replyMsg.length > 1) {
              ws.send(replyMsg);
            }
          } else if (messageType === 1) {
            
            awarenessProtocol.applyAwarenessUpdate(
              room!.awareness,
              decoding.readVarUint8Array(decoder),
              ws
            );
          }
        } else {
          
          const text = data.toString();
          const parsed = JSON.parse(text);
          const validated = WsMessageSchema.safeParse(parsed);

          if (validated.success) {
            const msg = validated.data;
            if (msg.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              return;
            }

            
            const payloadStr = JSON.stringify(msg);
            room!.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(payloadStr);
              }
            });
          }
        }
      } catch (err) {
        console.error('[WS Message Error]:', err);
      }
    });

    ws.on('close', () => {
      if (room) {
        room.clients.delete(ws);
        if (room.clients.size === 0) {
          
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WS Socket Error]:', err);
    });
  });

  return wss;
}
