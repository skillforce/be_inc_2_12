import mongoose, { Model, Schema } from 'mongoose';
import { CommentLikeDBModel, LikeStatusEnum } from '../types/types';

const CommentLikeSchema = new Schema<CommentLikeDBModel>(
  {
    userId: { type: String, required: true },
    commentId: { type: String, required: true },
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
  CommentLikeSchema,
);
