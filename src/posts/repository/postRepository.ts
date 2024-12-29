import { postService } from "../domain/postService";
import { AddUpdatePostRequestRequiredData, PostDBType } from "../types/types";
import { db } from "../../db/db";


export const postRepository = {
    getAllPosts: async (): Promise<PostDBType[]> => {
        return await postService.getAllPosts();
    },

    getPostById: async (id: string): Promise<PostDBType | null> => {
        const postById =await postService.getPostById(id);
        return postById || null;
    },

    addPost: async ({blogId,title,content,shortDescription }: AddUpdatePostRequestRequiredData): Promise<PostDBType> => {

        const blogById = await db.blogs.find(blog => blog.id === blogId);

        const newPostData: PostDBType = {
            id: String(Date.now()),
            title,
            shortDescription,
            content,
            blogName:blogById?.name??'',
            blogId,
        };

        await postService.addPost(newPostData)
        return newPostData;
    },

    updatePost: async (id: string, videoDataForUpdate: AddUpdatePostRequestRequiredData): Promise<boolean> => {
        const postById = await postService.getPostById(id);

        if (!postById) {
            return false;
        }
        const blogById = await db.blogs.find(blog => blog.id === postById.blogId);

        if (!blogById) {
            return false;
        }
        const updatePostData = {...videoDataForUpdate, blogName:blogById?.name??''}
        await postService.updatePost(id,updatePostData)
        return true;
    },

    deletePost: async (id: string): Promise<boolean> => {
        const postById = await postRepository.getPostById(id);
        if (!postById) {
            return false;
        }
        await postService.deletePost(id)
        return true;
    },
};