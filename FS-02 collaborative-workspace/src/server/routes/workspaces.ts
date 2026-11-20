import { Router, Request, Response, NextFunction } from 'express';
import { DEFAULT_USERS, getDocuments, getCanvases, getActivities } from '../../lib/storage';

export const workspacesRouter = Router();

workspacesRouter.get('/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await getDocuments();
    const canvases = await getCanvases();
    const activities = await getActivities();

    res.json({
      workspace: {
        id: 'ws-default',
        name: 'Engineering & Design Core',
        slug: 'engineering-core',
        icon: '⚡',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      members: DEFAULT_USERS,
      stats: {
        documentsCount: docs.length,
        canvasesCount: canvases.length,
        activitiesCount: activities.length,
        activeCollaboratorsCount: 3,
      },
    });
  } catch (err) {
    next(err);
  }
});

workspacesRouter.get('/users', async (req: Request, res: Response) => {
  res.json(DEFAULT_USERS);
});
