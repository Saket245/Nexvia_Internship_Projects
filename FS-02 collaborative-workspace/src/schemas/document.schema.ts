import { z } from 'zod';

export const BlockTypeEnum = z.enum([
  'paragraph',
  'heading-1',
  'heading-2',
  'heading-3',
  'todo',
  'bullet',
  'number',
  'code',
  'callout',
  'quote',
  'divider'
]);

export const DocumentBlockSchema = z.object({
  id: z.string().min(1, 'Block ID is required'),
  type: BlockTypeEnum.default('paragraph'),
  text: z.string().default(''),
  checked: z.boolean().optional(),
  language: z.string().optional(),
  icon: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional().default({}),
});

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Document title cannot be empty').max(512, 'Title is too long').default('Untitled Document'),
  icon: z.string().max(64).optional().default('📄'),
  coverImage: z.string().url().or(z.string().length(0)).optional().nullable(),
  workspaceId: z.string().min(1).default('ws-default'),
  content: z.string().optional().default(''),
  blocks: z.array(DocumentBlockSchema).optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(512).optional(),
  icon: z.string().max(64).optional(),
  coverImage: z.string().url().or(z.string().length(0)).optional().nullable(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
  blocks: z.array(DocumentBlockSchema).optional(),
});

export const CreateBlockSchema = z.object({
  type: BlockTypeEnum.default('paragraph'),
  text: z.string().default(''),
  checked: z.boolean().optional(),
  language: z.string().optional(),
  icon: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export const UpdateBlockSchema = z.object({
  type: BlockTypeEnum.optional(),
  text: z.string().optional(),
  checked: z.boolean().optional(),
  language: z.string().optional(),
  icon: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export const ReorderBlocksSchema = z.object({
  blockIds: z.array(z.string().min(1)),
});

export type BlockType = z.infer<typeof BlockTypeEnum>;
export type DocumentBlock = z.infer<typeof DocumentBlockSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type CreateBlockInput = z.infer<typeof CreateBlockSchema>;
export type UpdateBlockInput = z.infer<typeof UpdateBlockSchema>;
export type ReorderBlocksInput = z.infer<typeof ReorderBlocksSchema>;
