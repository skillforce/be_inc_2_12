import { ObjectId } from "mongodb";

interface CommentatorInfo {
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

