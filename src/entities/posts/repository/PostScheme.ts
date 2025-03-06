import mongoose, { Schema } from 'mongoose';
import { PostDBModel } from '../types/types';

const PostSchema = new Schema<PostDBModel>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true, default: Date.now.toString() },
});

export const PostModel = mongoose.model<PostDBModel>('Post', PostSchema);
