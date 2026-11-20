import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validate';
import {
  CreateActivitySchema,
  CreateActivityInput,
} from '../../schemas/activity.schema';
import { getActivities, recordActivity } from '../../lib/storage';

export const activitiesRouter = Router();

activitiesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await getActivities();
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    res.json(list.slice(0, limit));
  } catch (err) {
    next(err);
  }
});

activitiesRouter.post(
  '/',
  validateBody(CreateActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { action, entityType, entityTitle } = req.body as CreateActivityInput;
      const activity = await recordActivity(
        action.toUpperCase(),
        entityType.toUpperCase(),
        entityTitle
      );
      res.status(201).json(activity);
    } catch (err) {
      next(err);
    }
  }
);
