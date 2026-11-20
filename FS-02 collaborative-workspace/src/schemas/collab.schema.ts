import { z } from 'zod';

export const CursorPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userColor: z.string().default('#6366f1'),
  activeTool: z.string().optional().default('cursor'),
  blockId: z.string().optional(),
});

export const PresenceUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().default('#6366f1'),
  avatar: z.string().optional().nullable(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  activeTool: z.string().optional(),
  activeBlockId: z.string().optional(),
  lastSeen: z.number().default(() => Date.now()),
});

export const WsMessageTypeEnum = z.enum([
  'join',
  'leave',
  'cursor',
  'presence',
  'doc_update',
  'canvas_update',
  'ping',
  'pong',
  'yjs_sync'
]);

export const WsMessageSchema = z.object({
  type: WsMessageTypeEnum,
  room: z.string().min(1),
  payload: z.any(),
  senderId: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

export type CursorPosition = z.infer<typeof CursorPositionSchema>;
export type PresenceUser = z.infer<typeof PresenceUserSchema>;
export type WsMessageType = z.infer<typeof WsMessageTypeEnum>;
export type WsMessage = z.infer<typeof WsMessageSchema>;
