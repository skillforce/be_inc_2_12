import { BlogDBType } from "../types/types";
import { blogCollection } from "../../../db/mongo-db";
import { ObjectId, SortDirection } from "mongodb";

export const blogQueryRepository = {
    async getAllBlogs (): Promise<BlogDBType[]> {
        return await blogCollection.find().toArray();
    },
    async getBlogsByConditionsWithPagination(
        filter: Record<string, any>,
        sortBy: string,
        sortDirection: SortDirection,
        skip: number,
        limit: number
    ): Promise<BlogDBType[]> {
        return await blogCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();
    },

    async countBlogs(filter: Record<string, any>): Promise<number> {
        return blogCollection.countDocuments(filter);
    },

    async  getBlogById (_id: ObjectId): Promise< BlogDBType | null> {
        const blogById = await blogCollection.findOne({_id})
        return blogById || null;
    },
}