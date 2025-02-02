import { Request, Response, Router } from 'express';
import { AddUpdatePostRequiredInputData, PostViewModel } from '../types/types';
import {
  addPostBodyValidators,
  createCommentByPostIdValidators,
  deletePostValidators,
  getCommentByPostIdValidators,
  updatePostBodyValidators,
} from '../middlewares/postInputValidationMiddleware';
import { postService } from '../domain/postService';
import { postQueryRepository } from '../repository/postQueryRepository';
import { blogQueryRepository } from '../../blogs/repository/blogQueryRepository';
import {
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndQueryAndUserId,
} from '../../../common/types/request';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { commentsQueryRepository } from '../../comments/repository/commentsQueryRepository';
import { PaginatedData } from '../../../common/types/pagination';
import { AddUpdateCommentInputData, CommentViewModel } from '../../comments/types/types';
import { SortQueryFieldsType } from '../../../common/types/sortQueryFieldsType';
import { commentsService } from '../../comments/domain/commentsService';
import { ObjectId } from 'mongodb';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { IdType } from '../../../common/types/id';
import { toObjectId } from '../../../common/middlewares/helper';

export const postRouter = Router({});

postRouter.get('/', async (req: Request, res: Response<PaginatedData<PostViewModel[]>>) => {
  const queryObj = req.query;
  const responseData = await postQueryRepository.getPaginatedPosts(
    queryObj as Record<string, string | undefined>,
  );
  res.status(HttpStatuses.Success).json(responseData);
});

postRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<PostViewModel>) => {
  const _id = toObjectId(req.params.id);
  if (!_id) {
    res.sendStatus(HttpStatuses.NotFound);
    return;
  }
  const responseData = await postQueryRepository.getPostById(_id);
  if (responseData) {
    res.status(HttpStatuses.Success).json(responseData);
    return;
  }
  res.sendStatus(HttpStatuses.NotFound);
});

postRouter.get(
  '/:id/comments',
  getCommentByPostIdValidators,
  async (
    req: RequestWithParamsAndQueryAndUserId<
      {
        id: string;
      },
      SortQueryFieldsType,
      IdType
    >,
    res: Response<PaginatedData<CommentViewModel[]>>,
  ) => {
    const postId = toObjectId(req.params.id);
    const query = req.query;

    if (!postId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await postQueryRepository.getPostById(postId);

    if (!postById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const commentsList = await commentsQueryRepository.getPaginatedCommentsByPostId(query, postId);

    res.status(HttpStatuses.Success).send(commentsList);
  },
);

postRouter.post(
  '/:id/comments',
  createCommentByPostIdValidators,
  async (
    req: RequestWithParamsAndBodyAndUserId<
      {
        id: string;
      },
      AddUpdateCommentInputData,
      IdType
    >,
    res: Response<CommentViewModel>,
  ) => {
    const postId = toObjectId(req.params.id);
    const newCommentContent = req.body.content;
    const userObjectId = toObjectId(req.user?.id!);

    if (!postId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await postQueryRepository.getPostById(postId);

    if (!postById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newCommentResult = await commentsService.createComment({
      userId: userObjectId as ObjectId,
      postId,
      content: newCommentContent,
    });

    if (newCommentResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(newCommentResult.status));
      return;
    }

    const createdComment = await commentsQueryRepository.getCommentById(
      newCommentResult.data as ObjectId,
    );

    if (!createdComment) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).send(createdComment);
  },
);

postRouter.post(
  '/',
  addPostBodyValidators,
  async (req: Request<any, AddUpdatePostRequiredInputData>, res: Response<PostViewModel>) => {
    const { blogId } = req.body;
    const _id = toObjectId(blogId);
    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await blogQueryRepository.getBlogById(_id);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newPost = await postService.addPost(req.body, blogById);

    if (!newPost) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const createdPostForOutput = await postQueryRepository.getPostById(newPost);

    if (!createdPostForOutput) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Created).json(createdPostForOutput);
  },
);

postRouter.put(
  '/:id',
  updatePostBodyValidators,
  async (req: Request<{ id: string }, AddUpdatePostRequiredInputData>, res: Response<any>) => {
    const queryIdForUpdate = req.params.id;
    const newDataForPostToUpdate = req.body;
    const _id = toObjectId(queryIdForUpdate);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await postQueryRepository.getPostById(_id);
    const postBlogId = toObjectId(newDataForPostToUpdate.blogId);

    if (!postById || !postBlogId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await blogQueryRepository.getBlogById(postBlogId);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const isBlogUpdated = await postService.updatePost(_id, blogById, newDataForPostToUpdate);

    if (!isBlogUpdated) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);

postRouter.delete(
  '/:id',
  deletePostValidators,
  async (req: Request<{ id: string }>, res: Response<any>) => {
    const queryId = req.params.id;
    const post = await postService.deletePost(queryId);
    if (!post) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);
