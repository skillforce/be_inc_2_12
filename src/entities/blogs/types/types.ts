import { ObjectId, SortDirection } from "mongodb";

export interface BlogDBOutputType {
    id: string
    name:string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export interface BlogsOutputWithPagination{
    items: BlogDBOutputType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}
export interface BlogDBType {
    _id: ObjectId
    name:string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export interface AddUpdateBlogRequestRequiredData {
    name:string
    description: string
    websiteUrl: string
}

export interface AddBlogRequestRequiredData {
    name:string
    description: string
    websiteUrl: string
    createdAt: string,
    isMembership: boolean
}

export interface GetPaginatedBlogsArgs {
    filter: Record<string, any>,
    sortBy: string,
    sortDirection: SortDirection,
    skip: number,
    limit: number,
    pageNumber:number
}
