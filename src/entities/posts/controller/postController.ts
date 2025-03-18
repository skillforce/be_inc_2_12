import { PostService } from '../service/postService';
import { PostQueryRepository } from '../infrastructure/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/infrastructure/blogQueryRepository';
import { Request, Response } from 'express';
import { PaginatedData } from '../../../common/types/pagination';
import { PostViewModel, UpdatePostDTO } from '../types/types';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { toObjectId } from '../../../common/helpers/helper';
import {
  RequestWithParamsAndBodyAndUserId,
  RequestWithParamsAndQueryAndUserId,
  RequestWithParamsAndUserId,
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
import { LikesQueryRepository, LikeStatusEnum } from '../../likes';
import { ExtendedLikesInfoViewModel } from '../../likes/types/types';

export class PostController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(PostQueryRepository) protected postQueryRepository: PostQueryRepository,
    @inject(BlogQueryRepository) protected blogQueryRepository: BlogQueryRepository,
    @inject(CommentsService) protected commentsService: CommentsService,
    @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    @inject(LikesQueryRepository)
    protected likesQueryRepository: LikesQueryRepository,
  ) {}
  async getPosts(req: Request, res: Response<PaginatedData<PostViewModel[]>>) {
    const queryObj = req.query;
    const userId = req.user?.id;
    const postsList = await this.postQueryRepository.getPaginatedPosts(
      queryObj as Record<string, string | undefined>,
    );
    const postsIds = postsList.items.map((post) => post.id);
    const likesInfoMap = await this.likesQueryRepository.getBulkLikesInfo({
      parentIds: postsIds,
      userId: userId,
    });
    const newestLikesMap = await this.likesQueryRepository.getBulkNewestLikesForParentIds(postsIds);

    const extendedLikesInfoMap: Record<string, ExtendedLikesInfoViewModel> = {};
    postsList.items.forEach((post) => {
      const likesInfo = likesInfoMap[post.id];
      const newestLikes = newestLikesMap[post.id];
      const extendedLikesInfo: ExtendedLikesInfoViewModel = {
        ...likesInfo,
        newestLikes,
      };
      extendedLikesInfoMap[post.id] = extendedLikesInfo;
    });
    const postsListWithLikesInfo = postsList.items.map((post) => {
      const extendedLikesInfo = extendedLikesInfoMap[post.id];
      const postWithExtendedLikesInfo: PostViewModel = { ...post, extendedLikesInfo };
      return postWithExtendedLikesInfo;
    });

    const paginatedCommentsList = {
      ...postsList,
      items: postsListWithLikesInfo.reverse(),
    };
    res.status(HttpStatuses.Success).json(paginatedCommentsList);
  }
  async getPostById(
    req: RequestWithParamsAndUserId<{ id: string }, IdType>,
    res: Response<PostViewModel>,
  ) {
    const postId = req.params.id;
    const userId = req.user?.id;
    const _id = toObjectId(req.params.id);
    if (!_id) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const postById = await this.postQueryRepository.getPostById(_id);
    if (!postById) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    const likesInfo = await this.likesQueryRepository.getEntityLikesInfo({
      parentId: postId,
      userId,
    });
    const newestLikesInfo = await this.likesQueryRepository.getNewestLikesForParentId(postId);

    const extendedLikesInfo: ExtendedLikesInfoViewModel = {
      ...likesInfo,
      newestLikes: newestLikesInfo,
    };

    const postWithExtendedLikesInfo: PostViewModel = { ...postById, extendedLikesInfo };

    res.status(HttpStatuses.Success).json(postWithExtendedLikesInfo);
    return;
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

    const commentIds = commentsList.items.map((comment) => comment.id);
    const likesInfoMap = await this.likesQueryRepository.getBulkLikesInfo({
      parentIds: commentIds,
      userId: req.user?.id,
    });

    const commentsListWithLikesInfo = commentsList.items.map((comment) => ({
      ...comment,
      likesInfo: likesInfoMap[comment.id],
    }));

    const paginatedCommentsList = {
      ...commentsList,
      items: commentsListWithLikesInfo.reverse(),
    };

    res.status(HttpStatuses.Success).send(paginatedCommentsList);
  }

  async updatePostLikeStatus(
    req: RequestWithParamsAndBodyAndUserId<{ id: string }, { likeStatus: LikeStatusEnum }, IdType>,
    res: Response<{}>,
  ) {
    const postId = req.params.id;
    const userId = req.user?.id as string;
    const likeStatus = req.body.likeStatus;

    const updateCommentLikeStatus = await this.postService.updatePostLikeStatus(
      postId,
      userId,
      likeStatus,
    );

    if (updateCommentLikeStatus.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(updateCommentLikeStatus.status));
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
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

    const likesInfo = await this.likesQueryRepository.getEntityLikesInfo({
      parentId: createdComment.id,
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
    const extendedLikesInfo: ExtendedLikesInfoViewModel = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatusEnum.NONE,
      newestLikes: [],
    };

    if (!createdPostForOutput) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }

    res.status(HttpStatuses.Created).json({ ...createdPostForOutput, extendedLikesInfo });
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
