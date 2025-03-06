import mongoose, { Schema } from 'mongoose';
import { CommentatorInfo, CommentDBModel } from '../types/types';
import { ObjectId } from 'mongodb';

const CommentatorInfoSchema = new Schema<CommentatorInfo>({
  userId: { type: ObjectId, required: true },
  userLogin: { type: String, required: true },
});

const CommentSchema = new Schema<CommentDBModel>({
  content: { type: String, required: true },
  commentatorInfo: { type: CommentatorInfoSchema, required: true },
  createdAt: { type: String, required: true, default: Date.now.toString() },
  postId: { type: ObjectId, required: true, ref: 'Post' },
});

export const CommentModel = mongoose.model<CommentDBModel>('Comment', CommentSchema);
