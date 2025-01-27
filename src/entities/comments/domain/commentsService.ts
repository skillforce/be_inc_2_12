import { UpdateCommentRequestRequiredData } from "../types/types";
import { commentsRepository } from "../repository/commentsRepository";
import { toObjectId } from "../../../common/helpers";


export const commentsService = {
    // addBlog: async ({
    //                     name,
    //                     websiteUrl,
    //                     description
    //                 }: AddUpdateBlogRequestRequiredData): Promise<ObjectId | null> => {
    //
    //     const newBlogData: AddBlogRequestRequiredData = {
    //         name,
    //         websiteUrl,
    //         description,
    //         createdAt: new Date().toISOString(),
    //         isMembership: false
    //     };
    //
    //     const createdBlogId = await commentsRepository.addBlog(newBlogData)
    //
    //     if (!createdBlogId) {
    //         return null;
    //     }
    //
    //
    //     return createdBlogId;
    // },

    updateComment: async (id: string, videoDataForUpdate: UpdateCommentRequestRequiredData): Promise<boolean> => {
        const _id = toObjectId(id)
        if (!_id) {
            return false;
        }
        return await commentsRepository.updateComment(_id, videoDataForUpdate)
    },

    deleteComment: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if (!_id) {
            return false;
        }
        return await commentsRepository.deleteComment(_id)
    },
};