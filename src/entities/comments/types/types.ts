import { ObjectId } from "mongodb";

export interface CommentatorInfo {
    userId: ObjectId
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
    postId:ObjectId
}


export interface AddAndUpdateCommentRequestRequiredData {
    content:string,
}

export interface AddCommentRequiredData {
    userId:ObjectId,
    content:string
    postId:ObjectId
}

