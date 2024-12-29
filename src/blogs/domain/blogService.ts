import { db, setDB } from "../../db/db";
import { AddUpdateBlogRequestRequiredData, BlogDBType } from "../types/types";


export const blogService = {
    getAllBlogs: async (): Promise<BlogDBType[]> => {
        return db.blogs;
    },

    getBlogById: async (id: string): Promise<BlogDBType | null> => {
        const blogById = db.blogs.find(blog => blog.id === id);
        return blogById || null;
    },

    addBlog: async (newBlogData: BlogDBType): Promise<BlogDBType> => {
        setDB({ blogs: [...db.blogs, newBlogData] });
        return newBlogData;
    },

    updateBlog: async (id:string, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
        const newBlogCollection = db.blogs.map(blog =>
            blog.id === id ? { ...blog, ...videoDataForUpdate } : blog
        );
        setDB({ blogs: newBlogCollection });
        return true;
    },

    deleteBlog: async (id: string): Promise<boolean> => {
        const newArr = db.blogs.filter(video => video.id !== id);
        setDB({ blogs: newArr });
        return true;
    },
};