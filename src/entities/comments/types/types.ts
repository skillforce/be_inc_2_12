import { ObjectId } from "mongodb";
import { PostOutputDBType } from "../../posts/types/types";

export interface CommentatorInfo {
    userId: string
    userLogin: string

}

export interface CommentDBOutputType {
    id: string
    content:string
    commentatorInfo: CommentatorInfo
    createdAt: string
}

export interface CommentDBType {
    _id: ObjectId
    content:string
    commentatorInfo: CommentatorInfo
    createdAt: string
}


export interface UpdateCommentRequestRequiredData {
    content:string,
    commentId: string
}

export interface AddCommentRequiredData {
    userId:string,
    content:string
}


export interface CommentsOutputWithPagination{
    items: CommentDBOutputType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}

