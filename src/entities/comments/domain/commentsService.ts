import {
  AddCommentDto,
  CommentatorInfo,
  CommentDBModel,
  AddUpdateCommentInputData,
} from '../types/types';
import { commentsRepository } from '../repository/commentsRepository';
import { ObjectId } from 'mongodb';
import { usersRepository } from '../../users/repository/usersRepository';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { UserDBModel } from '../../users';
import { toObjectId } from '../../../common/middlewares/helper';

export const commentsService = {
  createComment: async ({
    userId,
    postId,
    content,
  }: AddCommentDto): Promise<Result<ObjectId | null>> => {
    const creator = (await usersRepository.getUserById(userId)) as UserDBModel;

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

    const createdCommentId = await commentsRepository.addComment(newCommentData);

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
  },

  updateComment: async (
    commentId: string,
    videoDataForUpdate: AddUpdateCommentInputData,
    userId: string,
  ): Promise<Result<boolean>> => {
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
    const user = await usersRepository.getUserById(userObjectId);
    const comment = await commentsRepository.getCommentById(commentObjectId);

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
    const isUpdatedComment = await commentsRepository.updateComment(
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
  },

  deleteComment: async (commentId: string, userId: string): Promise<Result<boolean>> => {
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

    const comment = await commentsRepository.getCommentById(commentObjectId);
    const user = await usersRepository.getUserById(userObjectId);

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

    const isDeletedComment = await commentsRepository.deleteComment(commentObjectId);

    if (!isDeletedComment) {
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
  },
};
