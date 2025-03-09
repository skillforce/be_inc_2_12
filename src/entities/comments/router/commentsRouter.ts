import { Router } from 'express';
import {
  deleteCommentValidators,
  getCommentByIdValidators,
  updateCommentLikeStatusValidators,
  updateCommentValidators,
} from '../middlewares/commentsInputValidationMiddleware';
import { commentsController } from '../compositions-root/comments-composition-root';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  getCommentByIdValidators,
  commentsController.getCommentById.bind(commentsController),
);

commentsRouter.put(
  '/:id',
  updateCommentValidators,
  commentsController.updateCommentById.bind(commentsController),
);

commentsRouter.put(
  '/:id/like-status',
  updateCommentLikeStatusValidators,
  commentsController.updateCommentLikeStatus.bind(commentsController),
);

commentsRouter.delete(
  '/:id',
  deleteCommentValidators,
  commentsController.deleteCommentById.bind(commentsController),
);
