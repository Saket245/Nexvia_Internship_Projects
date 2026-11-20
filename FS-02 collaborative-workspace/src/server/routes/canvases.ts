import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validate';
import {
  CreateCanvasSchema,
  UpdateCanvasSchema,
  BatchUpdateElementsSchema,
  CreateCanvasInput,
  UpdateCanvasInput,
  BatchUpdateElementsInput,
} from '../../schemas/canvas.schema';
import {
  getCanvases,
  getCanvas,
  saveCanvas,
  deleteCanvas,
  recordActivity,
} from '../../lib/storage';
import { CanvasData, CanvasElement } from '../../lib/types';

export const canvasesRouter = Router();

canvasesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await getCanvases();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

canvasesRouter.post(
  '/',
  validateBody(CreateCanvasSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, icon, workspaceId, zoom, panX, panY, elements } = req.body as CreateCanvasInput;
      const canvasId = `canvas-${Date.now()}`;

      const initialElements: CanvasElement[] = elements && elements.length > 0
        ? elements.map((e) => ({
            id: e.id,
            type: e.type as any,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            text: e.text || '',
            color: e.color,
            borderColor: e.borderColor,
            points: e.points,
            authorName: e.authorName,
          }))
        : [
            {
              id: `el-${Date.now()}-1`,
              type: 'sticky',
              x: 160,
              y: 140,
              width: 220,
              height: 180,
              text: '✨ Welcome to FigJam Whiteboard!\nDouble-click to edit, drag to move.',
              color: '#fef08a',
            },
          ];

      const newCanvas: CanvasData = {
        id: canvasId,
        workspaceId: workspaceId || 'ws-default',
        title: title || 'Untitled Canvas',
        icon: icon || '🎨',
        elements: initialElements,
        zoom: zoom || 1.0,
        panX: panX || 0,
        panY: panY || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        isArchived: false,
      };

      const saved = await saveCanvas(newCanvas);
      await recordActivity('CREATED', 'CANVAS', saved.title);

      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }
);

canvasesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const canvas = await getCanvas(id);
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found', id });
    }
    res.json(canvas);
  } catch (err) {
    next(err);
  }
});

canvasesRouter.patch(
  '/:id',
  validateBody(UpdateCanvasSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const existing = await getCanvas(id);
      if (!existing) {
        return res.status(404).json({ error: 'Canvas not found', id });
      }

      const updates = req.body as UpdateCanvasInput;
      const updatedCanvas: CanvasData = {
        ...existing,
        title: updates.title !== undefined ? updates.title : existing.title,
        icon: updates.icon !== undefined ? updates.icon : existing.icon,
        zoom: updates.zoom !== undefined ? updates.zoom : existing.zoom,
        panX: updates.panX !== undefined ? updates.panX : existing.panX,
        panY: updates.panY !== undefined ? updates.panY : existing.panY,
        elements: updates.elements !== undefined
          ? updates.elements.map((e) => ({
              id: e.id,
              type: e.type as any,
              x: e.x,
              y: e.y,
              width: e.width,
              height: e.height,
              text: e.text || '',
              color: e.color,
              borderColor: e.borderColor,
              points: e.points,
              authorName: e.authorName,
            }))
          : existing.elements,
        updatedAt: new Date().toISOString(),
      };

      const saved = await saveCanvas(updatedCanvas);
      await recordActivity('UPDATED', 'CANVAS', saved.title);

      res.json(saved);
    } catch (err) {
      next(err);
    }
  }
);

canvasesRouter.put(
  '/:id/elements',
  validateBody(BatchUpdateElementsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const existing = await getCanvas(id);
      if (!existing) {
        return res.status(404).json({ error: 'Canvas not found', id });
      }

      const body = req.body as BatchUpdateElementsInput;
      const mappedElements: CanvasElement[] = body.elements.map((e) => ({
        id: e.id,
        type: e.type as any,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        text: e.text || '',
        color: e.color,
        borderColor: e.borderColor,
        points: e.points,
        authorName: e.authorName,
      }));

      const updatedCanvas: CanvasData = {
        ...existing,
        elements: mappedElements,
        updatedAt: new Date().toISOString(),
      };

      const saved = await saveCanvas(updatedCanvas);
      res.json(saved.elements);
    } catch (err) {
      next(err);
    }
  }
);

canvasesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await getCanvas(id);
    if (!existing) {
      return res.status(404).json({ error: 'Canvas not found', id });
    }

    const success = await deleteCanvas(id);
    await recordActivity('DELETED', 'CANVAS', existing.title);

    res.json({ success, id });
  } catch (err) {
    next(err);
  }
});
