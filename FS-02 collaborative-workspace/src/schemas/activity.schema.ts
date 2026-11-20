import { z } from 'zod';

export const ActivityActionEnum = z.enum([
  'create',
  'update',
  'delete',
  'join',
  'leave',
  'archive',
  'export'
]);

export const EntityTypeEnum = z.enum([
  'document',
  'canvas',
  'block',
  'element',
  'workspace',
  'database'
]);

export const ActivitySchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().optional().nullable(),
  action: ActivityActionEnum,
  entityType: EntityTypeEnum,
  entityId: z.string().min(1),
  entityTitle: z.string().min(1),
  details: z.string().optional().nullable(),
  createdAt: z.string().datetime().or(z.date()),
});

export const CreateActivitySchema = z.object({
  workspaceId: z.string().min(1).default('ws-default'),
  userId: z.string().optional().nullable(),
  action: ActivityActionEnum,
  entityType: EntityTypeEnum,
  entityId: z.string().min(1),
  entityTitle: z.string().min(1),
  details: z.string().optional().nullable(),
});

export const QueryActivitiesSchema = z.object({
  workspaceId: z.string().optional().default('ws-default'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  entityType: EntityTypeEnum.optional(),
});

export type ActivityAction = z.infer<typeof ActivityActionEnum>;
export type EntityType = z.infer<typeof EntityTypeEnum>;
export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type QueryActivitiesInput = z.infer<typeof QueryActivitiesSchema>;
