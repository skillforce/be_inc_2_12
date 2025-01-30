import { ObjectId } from "mongodb";
import { SortQueryFieldsType } from "../../../common/types/sortQueryFieldsType";

export interface UserDBOutputType {
    id: string
    login: string
    email: string
    createdAt: string
}

export interface UserAuthOutputType {
    email: string
    login: string
    userId: string
}

export interface UserDBType {
    _id: ObjectId
    login: string
    email: string
    password: string
    createdAt: string
}

export interface AddUserRequestRequiredData {
    login: string
    email: string
    password: string
    createdAt: string
}


export interface AddUserInputQueryRequiredData {
    login: string
    email: string
    password: string
}


export enum UsersOutputMapEnum {
    VIEW = 'VIEW',
    AUTH = 'AUTH'
}

export interface GetPaginatedUsersQueryInterface extends SortQueryFieldsType {
    searchLoginTerm?: string
    searchEmailTerm?: string
}