import {
  AddCommentDto,
  CommentatorInfo,
  CommentDBModel,
  AddUpdateCommentInputData,
} from '../types/types';
import { CommentsRepository } from '../repository/commentsRepository';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../../users/repository/usersRepository';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { UserDBModel } from '../../users';
import { toObjectId } from '../../../common/helpers/helper';

export class CommentsService {
  constructor(
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  async createComment({
    userId,
    postId,
    content,
  }: AddCommentDto): Promise<Result<ObjectId | null>> {
    const creator = (await this.usersRepository.getUserById(userId)) as UserDBModel;

    const commentatorInfo: CommentatorInfo = {
      userId: creator._id,
      userLogin: creator.login,
    };

    const newCommentData: Omit<CommentDBModel, '_id'> = {
      content,
      commentatorInfo,
      postId,
      createdAt: new Date().toISOString(),
    };

    const createdCommentId = await this.commentsRepository.addComment(newCommentData);

    if (!createdCommentId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: createdCommentId,
      errorMessage: '',
      extensions: [],
    };
  }

  async updateComment(
    commentId: string,
    videoDataForUpdate: AddUpdateCommentInputData,
    userId: string,
  ): Promise<Result<boolean>> {
    const commentObjectId = toObjectId(commentId);
    const userObjectId = toObjectId(userId);

    if (!commentObjectId || !userObjectId) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }
    const user = await this.usersRepository.getUserById(userObjectId);
    const comment = await this.commentsRepository.getCommentById(commentObjectId);

    if (!user || !comment) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    if (user._id.toString() !== comment.commentatorInfo.userId.toString()) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        errorMessage: "Comment can be edited only by it's creator",
        extensions: [],
      };
    }
    const isUpdatedComment = await this.commentsRepository.updateComment(
      commentObjectId,
      videoDataForUpdate,
    );

    if (!isUpdatedComment) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }
  async checkIsUserOwnComment(commentId: ObjectId, userId: ObjectId): Promise<Result<boolean>> {
    const comment = await this.commentsRepository.getCommentById(commentId);
    const user = await this.usersRepository.getUserById(userId);

    if (!comment || !user) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    if (comment.commentatorInfo.userId.toString() !== user._id.toString()) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }

  async deleteComment(commentId: string, userId: string): Promise<Result<boolean>> {
    const commentObjectId = toObjectId(commentId);
    const userObjectId = toObjectId(userId);

    if (!commentObjectId || !userObjectId) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    const isUserOwnCommentResult = await this.checkIsUserOwnComment(commentObjectId, userObjectId);

    if (isUserOwnCommentResult.status !== ResultStatus.Success) {
      return isUserOwnCommentResult;
    }

    const isDeletedComment = await this.commentsRepository.deleteComment(commentObjectId);

    if (!isDeletedComment) {
      return {
        status: ResultStatus.ServerError,
        data: false,
        errorMessage: 'Server error occurred',
        extensions: [],
      };
    }
    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }
}
