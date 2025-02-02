import { ObjectId, SortDirection } from 'mongodb';
import { BlogViewModel } from '../../blogs/types/types';

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

export interface AddUpdatePostRequiredInputData {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface AddBlogDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
}
