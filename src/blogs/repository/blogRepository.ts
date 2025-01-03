import {
    AddBlogRequestRequiredData,
    AddUpdateBlogRequestRequiredData,
    BlogDBOutputType,
    BlogDBType
} from "../types/types";
import { blogCollection } from "../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";


export const blogRepository = {
    getAllBlogs: async (): Promise<BlogDBType[]> => {
        return await blogCollection.find().toArray();
    },

    getBlogById: async (_id: ObjectId): Promise< BlogDBType | null> => {
        const blogById = await blogCollection.findOne({_id})
        return blogById || null;
    },

    addBlog: async (newBlogData: AddBlogRequestRequiredData ): Promise<ObjectId> => {
       const result = await blogCollection
           .insertOne(newBlogData as WithId<AddBlogRequestRequiredData>)
       return result.insertedId;
    },

    updateBlog: async (_id: ObjectId, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
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

    deleteBlog: async (_id: ObjectId): Promise<boolean> => {
        const result = await blogCollection.deleteOne({_id})
        return result.deletedCount === 1;
    },
    async getBlogCollectionForOutput(): Promise<BlogDBOutputType[]> {
        const allBlogsFromDb = await blogCollection.find().toArray();
        return blogRepository.mapBlogArrayToOutput(allBlogsFromDb)
    },
    async getForOutputById(_id: ObjectId): Promise<BlogDBOutputType | null> {
        const blogById = await blogCollection.findOne({_id})
        return blogRepository.mapBlogToOutput(blogById)
    },
    mapBlogToOutput(blog: WithId<BlogDBType> | null): BlogDBOutputType | null {
        if (!blog) {
            return null
        }
        return {
            id: blog._id.toString(),
            name: blog.name,
            websiteUrl: blog.websiteUrl,
            description: blog.description,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }

    },
    mapBlogArrayToOutput(blogArray: Array<WithId<BlogDBType>>): Array<BlogDBOutputType> | [] {
        if (!blogArray.length) {
            return []
        }

        return blogArray.map(blog=>({
            id: blog._id.toString(),
            name: blog.name,
            websiteUrl: blog.websiteUrl,
            description: blog.description,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }))
    }

};