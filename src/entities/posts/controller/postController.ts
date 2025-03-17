import { PostService } from '../service/postService';
import { PostQueryRepository } from '../infrastructure/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/infrastructure/blogQueryRepository';
import { Request, Response } from 'express';
import { PaginatedData } from '../../../common/types/pagination';
import { UpdatePostDTO, PostViewModel } from '../types/types';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { toObjectId } from '../../../common/helpers/helper';
import {
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndQueryAndUserId,
} from '../../../common/types/request';
import { SortQueryFieldsType } from '../../../common/types/sortQueryFieldsType';
import { IdType } from '../../../common/types/id';
import { AddUpdateCommentInputData, CommentViewModel } from '../../comments/types/types';
import { CommentsQueryRepository } from '../../comments/infrastructure/commentsQueryRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { ObjectId } from 'mongodb';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { inject } from 'inversify';
import { LikesQueryRepository } from '../../likes';

export class PostController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(PostQueryRepository) protected postQueryRepository: PostQueryRepository,
    @inject(BlogQueryRepository) protected blogQueryRepository: BlogQueryRepository,
    @inject(CommentsService) protected commentsService: CommentsService,
    @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @inject(LikesQueryRepository)
    protected commentsLikesQueryRepository: LikesQueryRepository,
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

    // const commentIds = commentsList.items.map((comment) => comment.id);
    // const likesInfoMap = await this.commentsLikesQueryRepository.getBulkCommentLikesInfo({
    //   commentIds,
    //   userId: req.user?.id,
    // });
    //
    // const commentsListWithLikesInfo = commentsList.items.map((comment) => ({
    //   ...comment,
    //   likesInfo: likesInfoMap[comment.id],
    // }));
    //
    // const paginatedCommentsList = {
    //   ...commentsList,
    //   items: commentsListWithLikesInfo,
    // };

    const commentsListWithLikesInfo = await Promise.all(
      commentsList.items.map(async (comment) => {
        const likesInfo = await this.commentsLikesQueryRepository.getCommentLikesInfo({
          commentId: comment.id,
          userId: req.user?.id,
        });
        return { ...comment, likesInfo };
      }),
    );

    const paginatedCommentsList = {
      ...commentsList,
      items: commentsListWithLikesInfo,
    };

    res.status(HttpStatuses.Success).send(paginatedCommentsList);
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
    const userId = req.user?.id!;

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
      userId,
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

    const likesInfo = await this.commentsLikesQueryRepository.getCommentLikesInfo({
      commentId: createdComment.id,
      userId: req.user?.id,
    });

    res.status(HttpStatuses.Created).send({ ...createdComment, likesInfo });
  }
  async createPostByBlogId(req: Request<any, UpdatePostDTO>, res: Response<PostViewModel>) {
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
    req: RequestWithParamsAndBodyAndUserId<{ id: string }, UpdatePostDTO, IdType>,
    res: Response<any>,
  ) {
    const postId = req.params.id;
    const updatePostDTO = req.body;
    const postBlogId = toObjectId(updatePostDTO.blogId);

    if (!postBlogId) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const blogById = await this.blogQueryRepository.getBlogById(postBlogId);

    if (!blogById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    const postUpdateResult = await this.postService.updatePost(postId, {
      ...updatePostDTO,
      blogName: blogById.name,
    });

    if (postUpdateResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(postUpdateResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
  async deletePost(req: Request<{ id: string }>, res: Response<void>) {
    const postId = req.params.id;
    const result = await this.postService.deletePost(postId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(result.status));
      return;
    }
    await this.commentsService.deleteCommentsLikesByPostId(postId);
    res.sendStatus(HttpStatuses.NoContent);
  }
}
