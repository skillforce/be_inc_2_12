import {
    AddBlogRequestRequiredData,
    AddUpdateBlogRequestRequiredData,
    BlogDBOutputType,
    BlogDBType, BlogsOutputWithPagination
} from "../types/types";
import { blogRepository } from "../repository/blogRepository";
import { SortDirection, WithId } from "mongodb";
import { queryFilterGenerator, toObjectId } from "../../../helpers/helpers";
import { blogQueryRepository } from "../repository/blogQueryRepository";
import { blogCollection, postCollection } from "../../../db/mongo-db";


export const blogService = {
    getAllBlogs: async (): Promise<BlogDBOutputType[]> => {
        const allBlogsFromDb = await blogQueryRepository.getAllBlogs()
        return allBlogsFromDb.map(blogService.mapBlogToOutput)
    },

    getBlogsByQuery: async (query?: Record<string, string | undefined>): Promise<BlogsOutputWithPagination> => {
        const sanitizedQuery = queryFilterGenerator(query||{});
        const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} = sanitizedQuery;
        const searchText = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}} : {}


        const filter = {...searchText}

        const skip = (pageNumber - 1) * pageSize;
        const itemsFromDb = await blogQueryRepository.getBlogsByConditionsWithPagination(filter, sortBy, sortDirection as SortDirection, skip, pageSize);
        const totalCount = await blogQueryRepository.countBlogs(filter);
        const outputItems = itemsFromDb.map(blogService.mapBlogToOutput)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: outputItems
        }

    },
    getBlogById: async (id: string): Promise<BlogDBOutputType | null> => {
        const _id = toObjectId(id)
        console.log(_id)
        if (!_id) {
            return null
        }
        const blogById = await blogQueryRepository.getBlogById(_id);
        if (!blogById) {
            return null
        }
        return blogService.mapBlogToOutput(blogById)
    },

    addBlog: async ({
                        name,
                        websiteUrl,
                        description
                    }: AddUpdateBlogRequestRequiredData): Promise<BlogDBOutputType | null> => {

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
        const blogById = await blogQueryRepository.getBlogById(createdBlogId);
        if (!blogById) {
            return null
        }

        return blogService.mapBlogToOutput(blogById);
    },

    updateBlog: async (id: string, videoDataForUpdate: AddUpdateBlogRequestRequiredData): Promise<boolean> => {
        const blogById = await blogService.getBlogById(id);
        const _id = toObjectId(id)
        if (!blogById || !_id) {
            return false;
        }
        return await blogRepository.updateBlog(_id, videoDataForUpdate)
    },

    deleteBlog: async (id: string): Promise<boolean> => {
        const blogById = await blogService.getBlogById(id);
        const _id = toObjectId(id)

        if (!blogById || !_id) {
            return false;
        }
        return await blogRepository.deleteBlog(_id)
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
};