import {
    AddCommentRequiredData,
    CommentatorInfo,
    CommentDBType,
    UpdateCommentRequestRequiredData
} from "../types/types";
import { commentsRepository } from "../repository/commentsRepository";
import { toObjectId } from "../../../common/helpers";
import { ObjectId } from "mongodb";
import { usersService } from "../../users/domain/usersService";


export const commentsService = {
    addComment: async ({
                        userId,
                        content,
                    }: AddCommentRequiredData): Promise<ObjectId | null> => {

        const creator = await usersService.getUserById(userId)

        if(!creator){
            return null
        }

        const commentatorInfo: CommentatorInfo = {
            userId: creator._id.toString(),
            userLogin: creator.login
        }

        const newCommentData: Omit<CommentDBType,'_id'> = {
            content,
            commentatorInfo,
            createdAt: new Date().toISOString(),
        };

        const createdCommentId = await commentsRepository.addComment(newCommentData)

        if (!createdCommentId) {
            return null;
        }

        return createdCommentId;
    },

    updateComment: async (id: string, videoDataForUpdate: UpdateCommentRequestRequiredData): Promise<boolean> => {
        const _id = toObjectId(id)
        if (!_id) {
            return false;
        }
        return await commentsRepository.updateComment(_id, videoDataForUpdate)
    },

    deleteComment: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if (!_id) {
            return false;
        }
        return await commentsRepository.deleteComment(_id)
    },
};