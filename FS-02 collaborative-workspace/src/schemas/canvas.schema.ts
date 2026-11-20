import { z } from 'zod';

export const CanvasElementTypeEnum = z.enum([
  'sticky',
  'rectangle',
  'circle',
  'arrow',
  'text',
  'drawing'
]);

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const CanvasElementSchema = z.object({
  id: z.string().min(1, 'Element ID is required'),
  type: CanvasElementTypeEnum,
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(200),
  height: z.number().default(160),
  text: z.string().optional().default(''),
  color: z.string().optional().default('#fef08a'),
  borderColor: z.string().optional().default('#cbd5e1'),
  authorName: z.string().optional(),
  fontSize: z.number().optional(),
  points: z.array(PointSchema).optional(),
  properties: z.record(z.string(), z.any()).optional().default({}),
});

export const CreateCanvasSchema = z.object({
  title: z.string().min(1, 'Canvas title cannot be empty').max(512).default('Untitled Canvas'),
  icon: z.string().max(64).optional().default('🎨'),
  workspaceId: z.string().min(1).default('ws-default'),
  background: z.string().optional().default('#f8fafc'),
  zoom: z.number().positive().optional().default(1.0),
  panX: z.number().optional().default(0.0),
  panY: z.number().optional().default(0.0),
  elements: z.array(CanvasElementSchema).optional(),
});

export const UpdateCanvasSchema = z.object({
  title: z.string().min(1).max(512).optional(),
  icon: z.string().max(64).optional(),
  background: z.string().optional(),
  zoom: z.number().positive().optional(),
  panX: z.number().optional(),
  panY: z.number().optional(),
  elements: z.array(CanvasElementSchema).optional(),
});

export const CreateCanvasElementSchema = z.object({
  type: CanvasElementTypeEnum,
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(200),
  height: z.number().default(160),
  text: z.string().optional().default(''),
  color: z.string().optional().default('#fef08a'),
  borderColor: z.string().optional().default('#cbd5e1'),
  authorName: z.string().optional(),
  fontSize: z.number().optional(),
  points: z.array(PointSchema).optional(),
  properties: z.record(z.string(), z.any()).optional().default({}),
});

export const UpdateCanvasElementSchema = CanvasElementSchema.partial().required({ id: true });

export const BatchUpdateElementsSchema = z.object({
  elements: z.array(CanvasElementSchema),
});

export type CanvasElementType = z.infer<typeof CanvasElementTypeEnum>;
export type CanvasElement = z.infer<typeof CanvasElementSchema>;
export type CreateCanvasInput = z.infer<typeof CreateCanvasSchema>;
export type UpdateCanvasInput = z.infer<typeof UpdateCanvasSchema>;
export type CreateCanvasElementInput = z.infer<typeof CreateCanvasElementSchema>;
export type UpdateCanvasElementInput = z.infer<typeof UpdateCanvasElementSchema>;
export type BatchUpdateElementsInput = z.infer<typeof BatchUpdateElementsSchema>;
