import { ObjectId, SortDirection } from "mongodb";
import { BlogDBOutputType } from "../../blogs/types/types";

export interface PostOutputDBType {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export interface PostsOutputWithPagination{
    items: PostOutputDBType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}

export interface PostDBType {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export interface AddUpdatePostRequestRequiredData {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

export interface AddBlogRequestRequiredData{
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
    createdAt: string,
    blogName: string
}

export interface PostsOutputWithPagination{
    items: PostOutputDBType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}


export interface GetPaginatedPostsArgs {
    filter: Record<string, any>,
    sortBy: string,
    sortDirection: SortDirection,
    skip: number,
    limit: number,
    pageNumber:number
}

