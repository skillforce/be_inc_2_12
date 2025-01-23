import {  PostDBType, PostOutputDBType, PostsOutputWithPagination } from "../types/types";
import { postCollection } from "../../../db/mongo-db";
import { ObjectId } from "mongodb";
import { queryFilterGenerator } from "../../../helpers/helpers";

export const postQueryRepository = {
    async getPaginatedPosts(
       query:Record<string, string | undefined>,
       filter: Record<string, any>={}
    ): Promise<PostsOutputWithPagination> {

        const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

        const {pageNumber, pageSize, sortBy, sortDirection} = sanitizedQuery;
        const skip = (pageNumber - 1) * pageSize;

        const allPostsFromDb = await postCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await this.countPosts(filter)
        const itemsForOutput = allPostsFromDb.map(this.mapPostToOutput)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: itemsForOutput
        }
    },
    async getPostById(_id: ObjectId): Promise<PostOutputDBType | null> {
        const postById = await postCollection.findOne({_id})
        if(!postById){
            return null
        }
        return this.mapPostToOutput(postById);
    },
    async countPosts(filter: Record<string, any>): Promise<number> {
        return postCollection.countDocuments(filter);
    },

    mapPostToOutput(post: PostDBType): PostOutputDBType {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt
        }
    },


}