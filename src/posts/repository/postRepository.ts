import {
    AddBlogRequestRequiredData,
    AddUpdatePostRequestRequiredData,
    PostDBType,
    PostOutputDBType
} from "../types/types";
import { postCollection } from "../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";


export const postRepository = {
    getAllPosts: async (): Promise<PostDBType[]> => {
        return await postCollection.find().toArray();
    },

    getPostById: async (_id: ObjectId): Promise<PostDBType | null> => {
        const postById = await postCollection.findOne({_id})
        return postById || null;
    },

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

    async getAllPostsForOutput(): Promise<PostOutputDBType[]> {
        const allPostsFromDb = await postCollection.find().toArray();
        return postRepository.mapBlogArrayToOutput(allPostsFromDb)
    },
    async getPostForOutputById(_id: ObjectId): Promise<PostOutputDBType | null> {
        const postById = await postCollection.findOne({_id})
        return postRepository.mapBlogToOutput(postById)
    },
    mapBlogToOutput(post: PostDBType | null): PostOutputDBType | null {
        if (!post) {
            return null
        }
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }

    },
    mapBlogArrayToOutput(postArray: Array<PostDBType>): Array<PostOutputDBType> | [] {
        if (!postArray.length) {
            return []
        }

        return postArray.map(post=>({
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }))
    }


};