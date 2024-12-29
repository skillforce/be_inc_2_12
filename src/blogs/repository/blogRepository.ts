import { blogService } from "../domain/blogService";
import { AddUpdateBlogRequestRequiredData, BlogDBType } from "../types/types";


export const blogRepository = {
    getAllBlogs: async (): Promise<BlogDBType[]> => {
        return await blogService.getAllBlogs();
    },

    getBlogById: async (id: string): Promise<BlogDBType | null> => {
        const blogById =await blogService.getBlogById(id);
        return blogById || null;
    },

    addBlog: async ({name,websiteUrl,description }: AddUpdateBlogRequestRequiredData): Promise<BlogDBType> => {

        const newBlogData: BlogDBType = {
            id: String(Date.now()),
            name,
            websiteUrl,
            description
        };

        await blogService.addBlog(newBlogData)
        return newBlogData;
    },

    updateBlog: async (id: string, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
        const blogById = await blogService.getBlogById(id);
        if (!blogById) {
            return false;
        }
        await blogService.updateBlog(id,videoDataForUpdate)
        return true;
    },

    deleteBlog: async (id: string): Promise<boolean> => {
        const blogById = await blogRepository.getBlogById(id);
        if (!blogById) {
            return false;
        }
        await blogService.deleteBlog(id)
        return true;
    },
};