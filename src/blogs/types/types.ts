import { ObjectId } from "mongodb";

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

export interface AddBlogRequestRequiredData extends AddUpdateBlogRequestRequiredData {
    createdAt: string,
    isMembership: boolean
}
