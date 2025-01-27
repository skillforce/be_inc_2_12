import { AddBlogRequestRequiredData, AddUpdateBlogRequestRequiredData } from "../types/types";
import { ObjectId, WithId } from "mongodb";
import { db } from "../../../db/mongo-db";

export const blogRepository = {

    async addBlog (newBlogData: AddBlogRequestRequiredData ): Promise<ObjectId> {
       const result = await db.getCollections().blogCollection
           .insertOne(newBlogData as WithId<AddBlogRequestRequiredData>)
       return result.insertedId;
    },

    async updateBlog (_id: ObjectId, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> {
        const result = await db.getCollections().blogCollection.updateOne(
            {_id},
            {
                $set:
                    {
                        name: videoDataForUpdate.name,
                        websiteUrl: videoDataForUpdate.websiteUrl,
                        description: videoDataForUpdate.description
                    }
            })
        return result.matchedCount === 1;
    },

    async deleteBlog(_id: ObjectId): Promise<boolean> {
        const result = await db.getCollections().blogCollection.deleteOne({_id})
        return result.deletedCount === 1;
    }

};