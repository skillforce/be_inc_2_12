import { ObjectId, WithId } from "mongodb";
import { db } from "../../../db/mongo-db";
import { CommentDBOutputType, CommentDBType } from "../types/types";


export const commentsQueryRepository = {
    async getCommentById(_id: ObjectId): Promise<CommentDBOutputType | null> {
        const commentById = await db.getCollections().commentsCollection.findOne({_id})

        if (!commentById) {
            return null
        }
        return this.mapCommentToOutput(commentById);
    },
    mapCommentToOutput(comment: WithId<CommentDBType>): CommentDBOutputType {
        return {
            id: comment._id.toString(),
            commentatorInfo:comment.commentatorInfo,
            content: comment.content,
            createdAt: comment.createdAt
        }

    }
}