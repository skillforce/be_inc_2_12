import { APP_CONFIG } from '../../../settings';
import { NextFunction, Request, Response } from 'express';

export const ADMIN_AUTH = APP_CONFIG.ADMIN_AUTH;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization'] as string;

  if (!auth) {
    res.status(401).json({});
    return;
  }

  const buff2 = Buffer.from(ADMIN_AUTH, 'utf8');
  const codedAuth = buff2.toString('base64');

  if (auth.slice(6) !== codedAuth || auth.slice(0, 6) !== 'Basic ') {
    res.status(401).json({});
    return;
  }

  next();
};
