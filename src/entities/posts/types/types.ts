import { ObjectId } from "mongodb";

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

export interface AddBlogRequestRequiredData extends AddUpdatePostRequestRequiredData{
    createdAt: string,
    blogName: string
}

