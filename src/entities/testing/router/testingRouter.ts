import { Request, Response, Router } from 'express';
import { db } from '../../../db/mongo-db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (_: Request, res: Response) => {
  await db.drop();
  res.sendStatus(204);
});
