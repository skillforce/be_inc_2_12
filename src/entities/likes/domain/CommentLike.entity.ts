import mongoose, { Model, Schema } from 'mongoose';
import { CommentLikeDBModel, LikeStatusEnum } from '../types/types';

const CommentLikeEntity = new Schema<CommentLikeDBModel>(
  {
    userId: { type: String, required: true },
    parentId: { type: String, required: true },
    likeStatus: {
      type: String,
      enum: Object.values(LikeStatusEnum),
      required: true,
    },
  },
  { timestamps: true },
);

export const CommentLikeModel: Model<CommentLikeDBModel> = mongoose.model<CommentLikeDBModel>(
  'CommentLike',
  CommentLikeEntity,
);
