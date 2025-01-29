import { CommentDBType, UpdateCommentRequestRequiredData } from "../types/types";
import { ObjectId } from "mongodb";
import { db } from "../../../db/mongo-db";

export const commentsRepository = {

    async addComment (newCommentData: Omit<CommentDBType,'_id'> ): Promise<ObjectId> {
       const result = await db.getCollections().commentsCollection
           .insertOne(newCommentData as CommentDBType)
       return result.insertedId;
    },

    async updateComment (_id: ObjectId, dataForUpdate: UpdateCommentRequestRequiredData): Promise<boolean> {
        const result = await db.getCollections().commentsCollection.updateOne(
            {_id},
            {
                $set:
                    {
                        content: dataForUpdate.content
                    }
            })
        return result.matchedCount === 1;
    },

    async deleteComment(_id: ObjectId): Promise<boolean> {
        const result = await db.getCollections().commentsCollection.deleteOne({_id})
        return result.deletedCount === 1;
    },

    async getCommentById(_id: ObjectId): Promise<CommentDBType | null> {
        const commentById = await db.getCollections().commentsCollection.findOne({_id})

        if (!commentById) {
            return null
        }
        return commentById
    }

};