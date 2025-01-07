import { PostDBType } from "../types/types";
import { postCollection } from "../../../db/mongo-db";
import { Filter, ObjectId, SortDirection } from "mongodb";

export const postQueryRepository = {

    getPosts: async (filter?:Filter<any>): Promise<PostDBType[]> => {
        return await postCollection.find(filter ?? {}).toArray();
    },

    async getPostsByConditionsWithPagination(
        filter: Record<string, any>,
        sortBy: string,
        sortDirection: SortDirection,
        skip: number,
        limit: number
    ): Promise<PostDBType[]> {
        return await postCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();
    },

    async countPosts(filter: Record<string, any>): Promise<number> {
        return postCollection.countDocuments(filter);
    },

    getPostById: async (_id: ObjectId): Promise<PostDBType | null> => {
        const postById = await postCollection.findOne({_id})
        return postById || null;
    },


}