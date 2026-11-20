import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'editor', 'viewer']);

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  avatar: z.string().url().optional().nullable(),
  color: z.string().default('#6366f1'),
});

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
  icon: z.string().max(64).optional().default('🚀'),
});

export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().max(64).optional(),
});

export type UserRole = z.infer<typeof UserRoleEnum>;
export type User = z.infer<typeof UserSchema>;
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;
