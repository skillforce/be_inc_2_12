import { AddBlogRequestRequiredData, AddUpdatePostRequestRequiredData } from "../types/types";
import { postRepository } from "../repository/postRepository";
import { toObjectId } from "../../../helpers/helpers";
import { ObjectId } from "mongodb";
import { BlogDBOutputType } from "../../blogs/types/types";


export const postService = {
    addPost: async ({title,content,shortDescription }: Omit<AddUpdatePostRequestRequiredData,'blogId'>, blog:BlogDBOutputType): Promise<ObjectId|null> => {
        const newPostData:AddBlogRequestRequiredData = {
            title,
            shortDescription,
            content,
            blogId:blog.id,
            blogName:blog?.name,
            createdAt: new Date().toISOString()
        };

        return await postRepository.addPost(newPostData);
    },

    updatePost: async (id:ObjectId,blog:BlogDBOutputType, videoDataForUpdate: AddUpdatePostRequestRequiredData): Promise<boolean> => {

        const updatePostData = {...videoDataForUpdate, blogId:blog.id, blogName:blog.name}

        return await postRepository.updatePost(id,updatePostData)
    },

    deletePost: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)
        if(!_id){
            return false
        }
        return await postRepository.deletePost(_id)
    },

};