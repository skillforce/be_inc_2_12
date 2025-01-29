import {
    AddCommentRequiredData,
    CommentatorInfo,
    CommentDBType,
    UpdateCommentRequestRequiredData
} from "../types/types";
import { commentsRepository } from "../repository/commentsRepository";
import { toObjectId } from "../../../common/helpers";
import { ObjectId } from "mongodb";
import { usersRepository } from "../../users/repository/usersRepository";
import { Result } from "../../../common/result/result.type";
import { ResultStatus } from "../../../common/result/resultCode";


export const commentsService = {
    addComment: async ({
                           userId,
                           postId,
                           content,
                       }: AddCommentRequiredData): Promise<ObjectId | null> => {
        const userObjectId = toObjectId(userId)

        const creator = await usersRepository.getUserById(userObjectId as ObjectId)

        if (!creator) {
            return null
        }

        const commentatorInfo: CommentatorInfo = {
            userId: creator._id.toString(),
            userLogin: creator.login
        }

        const newCommentData: Omit<CommentDBType, '_id'> = {
            content,
            commentatorInfo,
            postId,
            createdAt: new Date().toISOString(),
        };

        const createdCommentId = await commentsRepository.addComment(newCommentData)

        if (!createdCommentId) {
            return null;
        }

        return createdCommentId;
    },

    updateComment: async (
        commentId: string,
        videoDataForUpdate: UpdateCommentRequestRequiredData,
        userId: string
    ): Promise<Result<boolean>> => {
        const commentObjectId = toObjectId(commentId)
        const userObjectId = toObjectId(userId)

        if (!commentObjectId || !userObjectId) {
            return {
                status:ResultStatus.NotFound,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            };
        }
        const user = await usersRepository.getUserById(userObjectId)
        const comment = await commentsRepository.getCommentById(userObjectId)

        if(user?._id !== comment?.commentatorInfo.userId) {
            return {
                status:ResultStatus.Forbidden,
                data: false,
                errorMessage: 'Comment can be edited only by it\'s creator',
                extensions: []
            }
        }
        const isUpdatedComment = await commentsRepository.updateComment(commentObjectId, videoDataForUpdate)

        if(!isUpdatedComment) {
            return {
                status:ResultStatus.NotFound,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            }
        }

        return {
            status:ResultStatus.Success,
            data: true,
            errorMessage: '',
            extensions: []
        }

    },

    deleteComment: async (commentId: string, userId: string): Promise<Result<boolean>> => {
        const commentObjectId = toObjectId(commentId)
        const userObjectId = toObjectId(userId)

        if (!commentObjectId || !userObjectId) {
            return {
                status:ResultStatus.NotFound,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            };
        }

        const comment = await commentsRepository.getCommentById(commentObjectId);
        const user = await usersRepository.getUserById(userObjectId)

        if (!comment || !user) {
            return {
                status:ResultStatus.NotFound,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            };
        }

        if (comment.commentatorInfo.userId !== user._id.toString()) {
            return {
                status:ResultStatus.Forbidden,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            };
        }

        const isDeletedComment = await commentsRepository.deleteComment(commentObjectId)

        if(!isDeletedComment) {
            return {
                status:ResultStatus.NotFound,
                data: false,
                errorMessage: 'Comment not found',
                extensions: []
            }
        }
        return {
            status:ResultStatus.Success,
            data: true,
            errorMessage: '',
            extensions: []
        }
    },
};