import { BlogDBOutputType, BlogDBType, BlogsOutputWithPagination } from "../types/types";
import { blogCollection } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";
import { queryFilterGenerator } from "../../../helpers/helpers";

export const blogQueryRepository = {
    async getAllBlogs(): Promise<BlogDBOutputType[]> {
        const allBlogsFromDb = await blogCollection.find().toArray()
        return allBlogsFromDb.map(this.mapBlogToOutput)
    },
    async getPaginatedBlogs(
        query: Record<string, string | undefined>,
        additionalFilters: Record<string, any> = {}
    ): Promise<BlogsOutputWithPagination> {

        const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

        const {pageNumber, pageSize, sortBy, sortDirection,searchNameTerm} = sanitizedQuery;
        const skip = (pageNumber - 1) * pageSize;
        const searchText = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}} : {}
        const filter = {...searchText,...additionalFilters}

        const itemsFromDb = await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await this.countBlogs(filter);
        const itemsForOutput = itemsFromDb.map(this.mapBlogToOutput)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
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