import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import { LikeDBModel, LikeStatusEnum } from '../types/types';

const LikeEntity = new Schema<LikeDBModel>(
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

const likeMethods = {
  async updateStatus(likeStatus: LikeStatusEnum): Promise<void> {
    const likeDocument = this as unknown as LikeDocument;
    if (likeDocument.likeStatus === likeStatus) {
      return;
    }
    likeDocument.likeStatus = likeStatus;
    await likeDocument.save();
  },
};
const likeStaticMethods = {
  createLike(likeDTO: LikeDBModel) {
    const newLike = new LikeModel(likeDTO) as unknown as LikeDocument;
    newLike.parentId = likeDTO.parentId;
    newLike.userId = likeDTO.userId;
    newLike.likeStatus = likeDTO.likeStatus;
    return newLike;
  },
};

type LikeMethods = typeof likeMethods;
type LikeStaticMethods = typeof likeStaticMethods;

export type LikeDocument = HydratedDocument<LikeDBModel, LikeMethods>;
type LikeModelType = Model<LikeDBModel, {}, LikeMethods> & LikeStaticMethods;

LikeEntity.methods = likeMethods;
LikeEntity.statics = likeStaticMethods;

export const LikeModel = mongoose.model<LikeDBModel, LikeModelType>('CommentLike', LikeEntity);
