import { ObjectId, SortDirection } from "mongodb";
import { PaginatedData } from "../../../common/types/pagination";
import { CommentDBOutputType } from "../../comments/types/types";

export interface BlogDBOutputType {
    id: string
    name:string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
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

