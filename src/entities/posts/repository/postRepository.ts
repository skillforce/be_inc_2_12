import { AddBlogRequestRequiredData, AddUpdatePostRequestRequiredData } from "../types/types";
import { postCollection } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";


export const postRepository = {
    addPost: async (newPostData:AddBlogRequestRequiredData): Promise<ObjectId> => {
       const result =  await postCollection
           .insertOne(newPostData as WithId<AddBlogRequestRequiredData>)
        return result.insertedId;
    },

    updatePost: async (_id: ObjectId, postDataForUpdates: AddUpdatePostRequestRequiredData): Promise<boolean> => {
        const result =  await postCollection.updateOne({_id}, {
            $set:
                {
                    title: postDataForUpdates.title,
                    shortDescription: postDataForUpdates.shortDescription,
                    content: postDataForUpdates.content
                }
        })
        return result.matchedCount === 1;
    },

    deletePost: async (_id: ObjectId): Promise<boolean> => {
        const result = await postCollection.deleteOne({_id})
        return result.deletedCount === 1;
    },




};