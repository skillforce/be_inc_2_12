import { Response, Router } from 'express';
import {
  deleteCommentValidators,
  getCommentByIdValidators,
  updateCommentValidators,
} from '../middlewares/commentsInputValidationMiddleware';
import { commentsService } from '../domain/commentsService';
import { commentsQueryRepository } from '../repository/commentsQueryRepository';
import { ObjectId } from 'mongodb';
import { CommentDBOutputType, AddAndUpdateCommentRequestRequiredData } from '../types/types';
import {
  RequestWithParams,
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndUserId,
} from '../../../common/types/request';
import { IdType } from '../../../common/types/id';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { toObjectId } from '../../../common/middlewares/helper';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  getCommentByIdValidators,
  async (req: RequestWithParams<{ id: string }>, res: Response<CommentDBOutputType>) => {
    const _id = toObjectId(req.params.id);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const responseData = await commentsQueryRepository.getCommentById(_id as ObjectId);

    if (!responseData) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.status(HttpStatuses.Success).json(responseData);
  },
);

commentsRouter.put(
  '/:id',
  updateCommentValidators,
  async (
    req: RequestWithParamsAndBodyAndUserId<
      { id: string },
      AddAndUpdateCommentRequestRequiredData,
      IdType
    >,
    res: Response<{}>,
  ) => {
    const commentId = req.params.id;
    const newDataForBlogToUpdate = req.body;
    const userId = req.user?.id as string;

    const updateBlogResult = await commentsService.updateComment(
      commentId,
      newDataForBlogToUpdate,
      userId,
    );

    if (updateBlogResult.status === ResultStatus.Forbidden) {
      res.sendStatus(HttpStatuses.Forbidden);
      return;
    }

    if (updateBlogResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

commentsRouter.delete(
  '/:id',
  deleteCommentValidators,
  async (req: RequestWithParamsAndUserId<{ id: string }, IdType>, res: Response<boolean>) => {
    const queryId = req.params.id;
    const userId = req.user?.id;

    const deleteCommentResult = await commentsService.deleteComment(queryId, userId as string);

    if (deleteCommentResult.status === ResultStatus.Forbidden) {
      res.sendStatus(HttpStatuses.Forbidden);
      return;
    }
    if (deleteCommentResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);
