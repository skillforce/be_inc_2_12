import { NextFunction, Request, Response } from 'express';
import { db } from '../../db/mongo-db';
import { TriggerAttemptsCollectionDBModel } from '../types/types';

export function createAttemptLimitMiddleware(routeName: string, limit = 5, windowSec = 10) {
  return async function attemptLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      if (!ip) {
        return res.status(400).json({ error: 'IP address not found' });
      }

      const attemptsCollection = db.getCollections().triggerAttemptsCollection;

      const windowStart = new Date(Date.now() - windowSec * 1000);

      const count = await attemptsCollection.countDocuments({
        ip,
        route: routeName,
        timestamp: { $gte: windowStart },
      });

      if (count >= limit) {
        return res.sendStatus(429);
      }

      await attemptsCollection.insertOne({
        ip,
        route: routeName,
        timestamp: new Date(),
      } as TriggerAttemptsCollectionDBModel);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
