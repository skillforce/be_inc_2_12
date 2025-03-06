import { PostService } from '../service/postService';
import { PostQueryRepository } from '../repository/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/repository/blogQueryRepository';
import { Request, Response } from 'express';
import { PaginatedData } from '../../../common/types/pagination';
import { AddUpdatePostRequiredInputData, PostViewModel } from '../types/types';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { toObjectId } from '../../../common/helpers/helper';
import {
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndQueryAndUserId,
} from '../../../common/types/request';
import { SortQueryFieldsType } from '../../../common/types/sortQueryFieldsType';
import { IdType } from '../../../common/types/id';
import { AddUpdateCommentInputData, CommentViewModel } from '../../comments/types/types';
import { CommentsQueryRepository } from '../../comments/repository/commentsQueryRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { ObjectId } from 'mongodb';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { inject } from 'inversify';

export class PostController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(PostQueryRepository) protected postQueryRepository: PostQueryRepository,
    @inject(BlogQueryRepository) protected blogQueryRepository: BlogQueryRepository,
    @inject(CommentsService) protected commentsService: CommentsService,
    @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async getPosts(req: Request, res: Response<PaginatedData<PostViewModel[]>>) {
    const queryObj = req.query;
    const responseData = await this.postQueryRepository.getPaginatedPosts(
      queryObj as Record<string, string | undefined>,
    );
    res.status(HttpStatuses.Success).json(responseData);
  }
  async getPostById(req: Request<{ id: string }>, res: Response<PostViewModel>) {
    const _id = toObjectId(req.params.id);
    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const responseData = await this.postQueryRepository.getPostById(_id);
    if (responseData) {
      res.status(HttpStatuses.Success).json(responseData);
      return;
    }
    res.sendStatus(HttpStatuses.NotFound);
  }
  async getPostCommentsByPostId(
    req: RequestWithParamsAndQueryAndUserId<
      {
        id: string;
      },
      SortQueryFieldsType,
      IdType
    >,
    res: Response<PaginatedData<CommentViewModel[]>>,
  ) {
    const postId = toObjectId(req.params.id);
    const query = req.query;

    if (!postId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await this.postQueryRepository.getPostById(postId);

    if (!postById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const commentsList = await this.commentsQueryRepository.getPaginatedCommentsByPostId(
      query,
      postId,
    );

    res.status(HttpStatuses.Success).send(commentsList);
  }
  async createCommentByPostId(
    req: RequestWithParamsAndBodyAndUserId<
      {
        id: string;
      },
      AddUpdateCommentInputData,
      IdType
    >,
    res: Response<CommentViewModel>,
  ) {
    const postId = toObjectId(req.params.id);
    const newCommentContent = req.body.content;
    const userObjectId = toObjectId(req.user?.id!);

    if (!postId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await this.postQueryRepository.getPostById(postId);

    if (!postById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newCommentResult = await this.commentsService.createComment({
      userId: userObjectId as ObjectId,
      postId,
      content: newCommentContent,
    });

    if (newCommentResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(newCommentResult.status));
      return;
    }

    const createdComment = await this.commentsQueryRepository.getCommentById(
      newCommentResult.data as ObjectId,
    );

    if (!createdComment) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).send(createdComment);
  }
  async createPostByBlogId(
    req: Request<any, AddUpdatePostRequiredInputData>,
    res: Response<PostViewModel>,
  ) {
    const { blogId } = req.body;
    const _id = toObjectId(blogId);
    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await this.blogQueryRepository.getBlogById(_id);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const newPostResult = await this.postService.addPost(req.body, blogById);

    if (newPostResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(newPostResult.status));
      return;
    }
    const createdPostForOutput = await this.postQueryRepository.getPostById(
      newPostResult.data as ObjectId,
    );

    if (!createdPostForOutput) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Created).json(createdPostForOutput);
  }
  async updatePost(
    req: Request<{ id: string }, AddUpdatePostRequiredInputData>,
    res: Response<any>,
  ) {
    const queryIdForUpdate = req.params.id;
    const newDataForPostToUpdate = req.body;
    const _id = toObjectId(queryIdForUpdate);

    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postById = await this.postQueryRepository.getPostById(_id);
    const postBlogId = toObjectId(newDataForPostToUpdate.blogId);

    if (!postById || !postBlogId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await this.blogQueryRepository.getBlogById(postBlogId);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const isBlogUpdatedResult = await this.postService.updatePost(
      _id,
      blogById,
      newDataForPostToUpdate,
    );

    if (isBlogUpdatedResult.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
  async deletePost(req: Request<{ id: string }>, res: Response<any>) {
    const queryId = req.params.id;
    const result = await this.postService.deletePost(queryId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(result.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
}
