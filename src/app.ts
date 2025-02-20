import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PATHS } from './common/paths/paths';
import { testingRouter } from './application/testing/router/testingRouter';
import { blogRouter } from './entities/blogs';
import { postRouter } from './entities/posts';
import { usersRouter } from './entities/users';
import { authRouter, securityRouter } from './application/auth';
import { commentsRouter } from './entities/comments';
import cookieParser from 'cookie-parser';

export const initApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.set('trust proxy', true);

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);

    // Capture response body
    const oldSend = res.send;
    res.send = function (this: Response, data: any) {
      console.log('Response:', data);
      return oldSend.call(this, data);
    };

    next();
  });

  app.use(PATHS.AUTH.COMMON, authRouter);
  app.use(PATHS.BLOGS, blogRouter);
  app.use(PATHS.COMMENTS, commentsRouter);
  app.use(PATHS.POSTS, postRouter);
  app.use(PATHS.USERS, usersRouter);
  app.use(PATHS.SECURITY, securityRouter);
  app.use(PATHS.TESTING, testingRouter);

  app.get('/', (req, res) => {
    res.status(200).json({ version: '1.1' });
  });

  return app;
};
