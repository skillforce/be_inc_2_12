import { AddBlogRequestRequiredData, AddUpdateBlogRequestRequiredData, BlogDBType } from "../types/types";
import { blogCollection } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";


export const blogRepository = {

    async addBlog (newBlogData: AddBlogRequestRequiredData ): Promise<ObjectId> {
       const result = await blogCollection
           .insertOne(newBlogData as WithId<AddBlogRequestRequiredData>)
       return result.insertedId;
    },

    async updateBlog (_id: ObjectId, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> {
        const result = await blogCollection.updateOne(
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
        const result = await blogCollection.deleteOne({_id})
        return result.deletedCount === 1;
    }

};