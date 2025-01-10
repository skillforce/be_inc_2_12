import { GetPaginatedPostsArgs, PostDBType, PostOutputDBType, PostsOutputWithPagination } from "../types/types";
import { postCollection } from "../../../db/mongo-db";
import { ObjectId } from "mongodb";

export const postQueryRepository = {
    async getPaginatedPosts(
        {
            filter,
            sortBy,
            sortDirection,
            skip,
            limit,
            pageNumber
        }:GetPaginatedPostsArgs
    ): Promise<PostsOutputWithPagination> {
        const allPostsFromDb = await postCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray();

        const totalCount = await this.countPosts(filter)
        const itemsForOutput = allPostsFromDb.map(this.mapPostToOutput)

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: pageNumber,
            pageSize:limit,
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