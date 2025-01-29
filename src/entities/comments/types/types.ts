import { ObjectId } from "mongodb";

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
    postId:string
}


export interface UpdateCommentRequestRequiredData {
    content:string,
}

export interface AddCommentRequiredData {
    userId:string,
    content:string
    postId:string
}


export interface CommentsOutputWithPagination{
    items: CommentDBOutputType[],
    totalCount: number,
    pagesCount: number,
    page: number,
    pageSize: number
}

