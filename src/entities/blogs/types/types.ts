import { ObjectId } from 'mongodb';

export interface BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export interface BlogDbModel {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export interface AddUpdateBlogRequiredInputData {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface AddBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
}
