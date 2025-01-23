import { ObjectId } from "mongodb";

export interface UserDBOutputType {
    id: string
    login: string
    email: string
    createdAt: string
}

export interface UserDBType {
    _id: ObjectId
    login: string
    email: string
    password: string
    createdAt: string
}

export interface AddUserRequestRequiredData {
    login:string
    email: string
    password:string
    createdAt: string
}

export interface UsersOutputWithPagination{
    items: UserDBOutputType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}
export interface AddUserInputQueryRequiredData {
    login:string
    email: string
    password:string
}