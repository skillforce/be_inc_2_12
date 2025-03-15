import { ObjectId } from 'mongodb';

export interface PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export interface PostDBModel {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export interface UpdatePostDTO {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface AddPostDTO {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt?: string;
  blogName: string;
}
