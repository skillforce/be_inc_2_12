import { BlogDBOutputType, BlogDBType, BlogsOutputWithPagination, GetPaginatedBlogsArgs } from "../types/types";
import { blogCollection } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";

export const blogQueryRepository = {
    async getAllBlogs(): Promise<BlogDBOutputType[]> {
        const allBlogsFromDb = await blogCollection.find().toArray()
        return allBlogsFromDb.map(this.mapBlogToOutput)
    },
    async getPaginatedBlogs(
        {
            filter,
            sortBy,
            sortDirection,
            skip,
            limit,
            pageNumber
        }: GetPaginatedBlogsArgs
    ): Promise<BlogsOutputWithPagination> {
        const itemsFromDb = await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalCount = await this.countBlogs(filter);
        const itemsForOutput = itemsFromDb.map(this.mapBlogToOutput)

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: pageNumber,
            pageSize: limit,
            totalCount,
            items: itemsForOutput
        }


    },

    async getBlogById(_id: ObjectId): Promise<BlogDBOutputType | null> {
        const blogById = await blogCollection.findOne({_id})

        if (!blogById) {
            return null
        }
        return this.mapBlogToOutput(blogById);
    },

    async countBlogs(filter: Record<string, any>): Promise<number> {
        return blogCollection.countDocuments(filter);
    },
    mapBlogToOutput(blog: WithId<BlogDBType>): BlogDBOutputType {
        return {
            id: blog._id.toString(),
            name: blog.name,
            websiteUrl: blog.websiteUrl,
            description: blog.description,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }

    }
}