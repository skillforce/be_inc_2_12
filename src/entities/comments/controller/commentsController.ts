import { CommentsQueryRepository } from '../repository/commentsQueryRepository';
import { CommentsService } from '../service/commentsService';
import {
  RequestWithParams,
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndUserId,
} from '../../../common/types/request';
import { Response } from 'express';
import { AddUpdateCommentInputData, CommentViewModel } from '../types/types';
import { toObjectId } from '../../../common/helpers/helper';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ObjectId } from 'mongodb';
import { IdType } from '../../../common/types/id';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject } from 'inversify';

export class CommentsController {
  constructor(
    @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @inject(CommentsService) protected commentsService: CommentsService,
  ) {}

  async getComments(req: RequestWithParams<{ id: string }>, res: Response<CommentViewModel>) {
    const _id = toObjectId(req.params.id);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const responseData = await this.commentsQueryRepository.getCommentById(_id as ObjectId);

    if (!responseData) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.status(HttpStatuses.Success).json(responseData);
  }

  async updateCommentById(
    req: RequestWithParamsAndBodyAndUserId<{ id: string }, AddUpdateCommentInputData, IdType>,
    res: Response<{}>,
  ) {
    const commentId = req.params.id;
    const newDataForBlogToUpdate = req.body;
    const userId = req.user?.id as string;

    const updateBlogResult = await this.commentsService.updateComment(
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
  }
  async deleteCommentById(
    req: RequestWithParamsAndUserId<{ id: string }, IdType>,
    res: Response<boolean>,
  ) {
    const queryId = req.params.id;
    const userId = req.user?.id;

    const deleteCommentResult = await this.commentsService.deleteComment(queryId, userId as string);

    if (deleteCommentResult.status === ResultStatus.Forbidden) {
      res.sendStatus(HttpStatuses.Forbidden);
      return;
    }
    if (deleteCommentResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
}
