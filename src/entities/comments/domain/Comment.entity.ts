import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import {
  AddUpdateCommentInputData,
  CommentatorInfo,
  CommentDBModel,
  CreateCommentDTO,
} from '../types/types';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';

const CommentatorInfoSchema = new Schema<CommentatorInfo>(
  {
    userId: { type: ObjectId, required: true },
    userLogin: { type: String, required: true },
  },
  { _id: false },
);

const CommentSchema = new Schema<CommentDBModel>({
  content: { type: String, required: true },
  commentatorInfo: { type: CommentatorInfoSchema, required: true },
  createdAt: { type: String, default: dayjs().toISOString() },
  postId: { type: ObjectId, required: true, ref: 'Post' },
});

const commentMethods = {
  isBelongToUser(userId: string) {
    const comment = this as unknown as CommentDocument;
    return comment.commentatorInfo.userId.toString() === userId;
  },

  async updateComment(dataForUpdate: { content: string }) {
    const commentToUpdate = this as unknown as CommentDocument;

    commentToUpdate.content = dataForUpdate.content;

    await commentToUpdate.save();
  },
};
const commentStaticMethods = {
  createComment({ commentatorInfo, postId, content }: CreateCommentDTO) {
    const newPost = new CommentModel() as unknown as CommentDocument;

    newPost.content = content;
    newPost.commentatorInfo = commentatorInfo;
    newPost.postId = postId;

    return newPost;
  },
};

type CommentMethods = typeof commentMethods;
type CommentStaticMethods = typeof commentStaticMethods;

CommentSchema.statics = commentStaticMethods;
CommentSchema.methods = commentMethods;

export type CommentDocument = HydratedDocument<CommentDBModel, CommentMethods>;
type CommentModel = Model<CommentDBModel, {}, CommentMethods> & CommentStaticMethods;

export const CommentModel = mongoose.model<CommentDBModel, CommentModel>('Comment', CommentSchema);
