import { ObjectId } from 'mongodb';
import { LikesInfoViewModel } from '../../likes/types/types';

export interface CommentatorInfo {
  userId: ObjectId;
  userLogin: string;
}

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
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

export interface AddCommentRequestDto {
  userId: string;
  content: string;
  postId: ObjectId;
}

export interface CreateCommentDTO {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt?: string;
  postId: ObjectId;
}
