import { AddBlogRequestRequiredData, AddUpdateBlogRequestRequiredData } from "../types/types";
import { blogRepository } from "../repository/blogRepository";
import { ObjectId } from "mongodb";
import { toObjectId } from "../../../common/helpers";


export const blogService = {
    addBlog: async ({
                        name,
                        websiteUrl,
                        description
                    }: AddUpdateBlogRequestRequiredData): Promise<ObjectId | null> => {

        const newBlogData: AddBlogRequestRequiredData = {
            name,
            websiteUrl,
            description,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

        const createdBlogId = await blogRepository.addBlog(newBlogData)

        if (!createdBlogId) {
            return null;
        }


        return createdBlogId;
    },

    updateBlog: async (id: string, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
        const _id = toObjectId(id)
        if (!_id) {
            return false;
        }
        return await blogRepository.updateBlog(_id, videoDataForUpdate)
    },

    deleteBlog: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if (!_id) {
            return false;
        }
        return await blogRepository.deleteBlog(_id)
    },
};