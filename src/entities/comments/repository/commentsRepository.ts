import { UpdateCommentRequestRequiredData } from "../types/types";
import { ObjectId } from "mongodb";
import { db } from "../../../db/mongo-db";

export const commentsRepository = {

    // async addBlog (newBlogData: AddBlogRequestRequiredData ): Promise<ObjectId> {
    //    const result = await db.getCollections().blogCollection
    //        .insertOne(newBlogData as WithId<AddBlogRequestRequiredData>)
    //    return result.insertedId;
    // },

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
    }

};