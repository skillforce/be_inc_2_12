import { AddBlogRequestRequiredData, AddUpdateBlogRequestRequiredData, BlogDBOutputType } from "../types/types";
import { blogRepository } from "../repository/blogRepository";
import { ObjectId } from "mongodb";
import { toObjectId } from "../../helpers/helpers";


export const blogService = {
    getAllBlogs: async (): Promise<BlogDBOutputType[]> => {
        return await blogRepository.getBlogCollectionForOutput();
    },

    getBlogById: async (id: string): Promise<BlogDBOutputType | null> => {
        const _id = toObjectId(id)
        if(!_id){
            return null
        }
        const blogById =await blogRepository.getForOutputById(_id);
        return blogById || null;
    },

    addBlog: async ({name,websiteUrl,description }: AddUpdateBlogRequestRequiredData): Promise<BlogDBOutputType|null> => {

        const newBlogData: AddBlogRequestRequiredData = {
            name,
            websiteUrl,
            description,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

       const createdBlog = await blogRepository.addBlog(newBlogData)

        if(!createdBlog){
            return null;
        }

       return await blogRepository.getForOutputById(createdBlog);
    },

    updateBlog: async (id: string, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
        const blogById = await blogService.getBlogById(id);
        const _id = toObjectId(id)
        if (!blogById || !_id) {
            return false;
        }
        return await blogRepository.updateBlog(_id,videoDataForUpdate)
    },

    deleteBlog: async (id: string): Promise<boolean> => {
        const blogById = await blogService.getBlogById(id);
        const _id = toObjectId(id)

        if (!blogById || !_id) {
            return false;
        }
        return await blogRepository.deleteBlog(_id)
    },
};