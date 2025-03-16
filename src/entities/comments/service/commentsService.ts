import {
  AddCommentRequestDto,
  AddUpdateCommentInputData,
  CommentatorInfo,
  CreateCommentDTO,
} from '../types/types';
import { CommentsRepository } from '../infrastructure/commentsRepository';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../../users/infrastructure/usersRepository';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';
import { LikesRepository, LikeStatusEnum } from '../../likes';
import { LikeModel } from '../../likes/domain/Like.entity';
import { CommentModel } from '../domain/Comment.entity';

@injectable()
export class CommentsService {
  constructor(
    @inject(UsersRepository) protected usersRepository: UsersRepository,
    @inject(CommentsRepository) protected commentsRepository: CommentsRepository,
    @inject(LikesRepository) protected likesRepository: LikesRepository,
  ) {}
  async createComment({
    userId,
    postId,
    content,
  }: AddCommentRequestDto): Promise<Result<ObjectId | null>> {
    const creator = await this.usersRepository.findById(userId);

    if (!creator) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'User not found',
        extensions: [],
      };
    }

    const commentatorInfo: CommentatorInfo = {
      userId: creator._id,
      userLogin: creator.login,
    };

    const newCommentData: CreateCommentDTO = {
      content,
      commentatorInfo,
      postId,
    };

    const newComment = CommentModel.createComment(newCommentData);

    await this.commentsRepository.saveComment(newComment);

    return {
      status: ResultStatus.Success,
      data: newComment._id,
      errorMessage: '',
      extensions: [],
    };
  }

  async updateComment(
    commentId: string,
    dataForCommentUpdate: AddUpdateCommentInputData,
    userId: string,
  ): Promise<Result<boolean>> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    if (!comment.isBelongToUser(userId)) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        errorMessage: "Comment can be edited only by it's creator",
        extensions: [],
      };
    }

    await comment.updateComment(dataForCommentUpdate);

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }
  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<Result<boolean>> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    const likeDocument = await this.likesRepository.findLikeByParentIdAndUserId(commentId, userId);

    if (!likeDocument) {
      const newLike = LikeModel.createLike({
        userId,
        parentId: commentId,
        likeStatus,
      });
      await this.likesRepository.saveLike(newLike);
      return {
        status: ResultStatus.Success,
        data: true,
        errorMessage: '',
        extensions: [],
      };
    }

    await likeDocument.updateStatus(likeStatus);

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }
  async deleteCommentsLikesByPostId(postId: string): Promise<Result<boolean>> {
    const commentsList = await this.commentsRepository.getCommentsByPostId(postId);

    if (!commentsList) {
      return {
        status: ResultStatus.ServerError,
        data: true,
        errorMessage: 'Server error',
        extensions: [],
      };
    }
    const commentsIds = commentsList.map((comment) => comment._id.toString());
    await this.likesRepository.deleteAllLikesByParentIds(commentsIds);

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }

  async deleteComment(commentId: string, userId: string): Promise<Result<boolean>> {
    const commentToDelete = await this.commentsRepository.findById(commentId);

    if (!commentToDelete) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    if (!commentToDelete.isBelongToUser(userId)) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        errorMessage: "Comment can be deleted only by it's creator",
        extensions: [],
      };
    }

    await this.commentsRepository.deleteComment(commentToDelete);
    await this.likesRepository.deleteAllLikesByParentId(commentId);

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }
}
