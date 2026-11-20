import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validate';
import {
  CreateDocumentSchema,
  UpdateDocumentSchema,
  CreateBlockSchema,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateBlockInput,
} from '../../schemas/document.schema';
import {
  getDocuments,
  getDocument,
  saveDocument,
  deleteDocument,
  recordActivity,
} from '../../lib/storage';
import { DocumentData, Block } from '../../lib/types';

export const documentsRouter = Router();

documentsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await getDocuments();
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

documentsRouter.post(
  '/',
  validateBody(CreateDocumentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, icon, coverImage, workspaceId, content, blocks } = req.body as CreateDocumentInput;
      const docId = `doc-${Date.now()}`;

      const initialBlocks: Block[] = blocks && blocks.length > 0
        ? blocks.map((b) => ({
            id: b.id || `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: b.type as any,
            text: b.text || '',
            checked: b.checked,
            language: b.language,
            icon: b.icon,
          }))
        : [
            {
              id: `b-${Date.now()}-1`,
              type: 'heading-1',
              text: title || 'Untitled Document',
            },
            {
              id: `b-${Date.now()}-2`,
              type: 'paragraph',
              text: content || 'Start typing or press "/" for commands...',
            },
          ];

      const newDoc: DocumentData = {
        id: docId,
        workspaceId: workspaceId || 'ws-default',
        title: title || 'Untitled Document',
        icon: icon || '📄',
        coverImage: coverImage || undefined,
        blocks: initialBlocks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        isArchived: false,
      };

      const saved = await saveDocument(newDoc);
      await recordActivity('CREATED', 'DOCUMENT', saved.title);

      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }
);

documentsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const doc = await getDocument(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found', id });
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

documentsRouter.patch(
  '/:id',
  validateBody(UpdateDocumentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const existing = await getDocument(id);
      if (!existing) {
        return res.status(404).json({ error: 'Document not found', id });
      }

      const updates = req.body as UpdateDocumentInput;
      const updatedDoc: DocumentData = {
        ...existing,
        title: updates.title !== undefined ? updates.title : existing.title,
        icon: updates.icon !== undefined ? updates.icon : existing.icon,
        coverImage: updates.coverImage !== undefined ? (updates.coverImage || undefined) : existing.coverImage,
        blocks: updates.blocks !== undefined
          ? updates.blocks.map((b) => ({
              id: b.id,
              type: b.type as any,
              text: b.text || '',
              checked: b.checked,
              language: b.language,
              icon: b.icon,
            }))
          : existing.blocks,
        updatedAt: new Date().toISOString(),
      };

      const saved = await saveDocument(updatedDoc);
      await recordActivity('UPDATED', 'DOCUMENT', saved.title);

      res.json(saved);
    } catch (err) {
      next(err);
    }
  }
);

documentsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await getDocument(id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found', id });
    }

    const success = await deleteDocument(id);
    await recordActivity('DELETED', 'DOCUMENT', existing.title);

    res.json({ success, id });
  } catch (err) {
    next(err);
  }
});

documentsRouter.post(
  '/:id/blocks',
  validateBody(CreateBlockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const doc = await getDocument(id);
      if (!doc) {
        return res.status(404).json({ error: 'Document not found', id });
      }

      const input = req.body as CreateBlockInput;
      const newBlock: Block = {
        id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: input.type as any,
        text: input.text || '',
        checked: input.checked,
        language: input.language,
        icon: input.icon,
      };

      const updatedDoc: DocumentData = {
        ...doc,
        blocks: [...doc.blocks, newBlock],
        updatedAt: new Date().toISOString(),
      };

      await saveDocument(updatedDoc);
      res.status(201).json(newBlock);
    } catch (err) {
      next(err);
    }
  }
);

documentsRouter.get('/:id/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const format = (req.query.format as string) || 'markdown';
    const doc = await getDocument(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found', id });
    }

    if (format === 'json') {
      return res.json(doc);
    }

    if (format === 'html') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #555; }
    .callout { background: #eef2ff; border-left: 4px solid #6366f1; padding: 12px; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>${doc.icon ? doc.icon + ' ' : ''}${doc.title}</h1>
  ${doc.blocks
    .map((b) => {
      switch (b.type) {
        case 'heading-1':
          return `<h2>${b.text}</h2>`;
        case 'heading-2':
          return `<h3>${b.text}</h3>`;
        case 'heading-3':
          return `<h4>${b.text}</h4>`;
        case 'code':
          return `<pre><code>${b.text}</code></pre>`;
        case 'quote':
          return `<blockquote>${b.text}</blockquote>`;
        case 'callout':
          return `<div class="callout">${b.text}</div>`;
        case 'todo':
          return `<div><input type="checkbox" ${b.checked ? 'checked' : ''} disabled /> ${b.text}</div>`;
        default:
          return `<p>${b.text}</p>`;
      }
    })
    .join('\n')}
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlContent);
    }

    
    const mdLines = [`# ${doc.icon ? doc.icon + ' ' : ''}${doc.title}\n`];
    for (const b of doc.blocks) {
      switch (b.type) {
        case 'heading-1':
          mdLines.push(`## ${b.text}\n`);
          break;
        case 'heading-2':
          mdLines.push(`### ${b.text}\n`);
          break;
        case 'heading-3':
          mdLines.push(`#### ${b.text}\n`);
          break;
        case 'code':
          mdLines.push(`\`\`\`\n${b.text}\n\`\`\`\n`);
          break;
        case 'quote':
          mdLines.push(`> ${b.text}\n`);
          break;
        case 'callout':
          mdLines.push(`> 💡 **Callout:** ${b.text}\n`);
          break;
        case 'todo':
          mdLines.push(`- [${b.checked ? 'x' : ' '}] ${b.text}`);
          break;
        default:
          mdLines.push(`${b.text}\n`);
      }
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.send(mdLines.join('\n'));
  } catch (err) {
    next(err);
  }
});
