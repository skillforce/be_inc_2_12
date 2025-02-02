import { ObjectId } from 'mongodb';

export interface CommentatorInfo {
  userId: ObjectId;
  userLogin: string;
}

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
}

export interface CommentDBModel {
  _id: ObjectId;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  postId: ObjectId;
}

export interface AddUpdateCommentInputData {
  content: string;
}

export interface AddCommentDto {
  userId: ObjectId;
  content: string;
  postId: ObjectId;
}
