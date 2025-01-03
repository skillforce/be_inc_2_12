import { AddBlogRequestRequiredData, AddUpdatePostRequestRequiredData, PostOutputDBType } from "../types/types";
import { postRepository } from "../repository/postRepository";
import { blogRepository } from "../../blogs/repository/blogRepository";
import { toObjectId } from "../../helpers/helpers";


export const postService = {
    getAllPosts: async (): Promise<PostOutputDBType[]> => {
        return await postRepository.getAllPostsForOutput();
    },

    getPostById: async (id: string): Promise<PostOutputDBType | null> => {
        const _id = toObjectId(id)
        if(!_id){
            return null
        }
        const postById =await postRepository.getPostForOutputById(_id);
        return postById || null;
    },

    addPost: async ({blogId,title,content,shortDescription }: AddUpdatePostRequestRequiredData): Promise<PostOutputDBType|null> => {
        const _id = toObjectId(blogId)
        if(!_id){
            return null
        }
        const blogById = await blogRepository.getBlogById(_id)

        const newPostData:AddBlogRequestRequiredData = {
            title,
            shortDescription,
            content,
            blogId,
            blogName:blogById?.name??'',
            createdAt: new Date().toISOString()
        };

        const newPostId = await postRepository.addPost(newPostData)

        const postById = await postRepository.getPostForOutputById(newPostId);

        if(!postById){
            return null
        }

        return postById;
    },

    updatePost: async (id: string, videoDataForUpdate: AddUpdatePostRequestRequiredData): Promise<boolean> => {
        const _id = toObjectId(id)

        if(!_id){
            return false
        }

        const postById = await postRepository.getPostById(_id);
        const postBlogId = toObjectId(postById?.blogId.toString()??'')



        if (!postById || !postBlogId) {
            return false;
        }
        const blogById = await blogRepository.getBlogById(postBlogId);

        if (!blogById) {
            return false;
        }
        const updatePostData = {...videoDataForUpdate, blogName:blogById?.name??''}
        return await postRepository.updatePost(_id,updatePostData)
    },

    deletePost: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if(!_id){
            return false
        }
        const postById = await postRepository.getPostById(_id);
        if (!postById) {
            return false;
        }
        return await postRepository.deletePost(_id)
    },
};