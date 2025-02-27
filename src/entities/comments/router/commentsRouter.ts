import { Router } from 'express';
import {
  deleteCommentValidators,
  getCommentByIdValidators,
  updateCommentValidators,
} from '../middlewares/commentsInputValidationMiddleware';
import { commentsController } from '../compositions-root/comments-composition-root';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  getCommentByIdValidators,
  commentsController.getComments.bind(commentsController),
);

commentsRouter.put(
  '/:id',
  updateCommentValidators,
  commentsController.updateCommentById.bind(commentsController),
);

commentsRouter.delete(
  '/:id',
  deleteCommentValidators,
  commentsController.deleteCommentById.bind(commentsController),
);
