import { AddUpdateCommentInputData, CommentDBModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { CommentModel } from '../domain/Comment.entity';

@injectable()
export class CommentsRepository {
  constructor() {}
  async addComment(newCommentData: Omit<CommentDBModel, '_id'>): Promise<ObjectId> {
    const result = await CommentModel.create(newCommentData);
    return result._id;
  }

  async updateComment(_id: ObjectId, dataForUpdate: AddUpdateCommentInputData): Promise<boolean> {
    const commentToUpdate = await CommentModel.findOne({ _id });
    if (!commentToUpdate) {
      return false;
    }
    commentToUpdate.content = dataForUpdate.content;
    await commentToUpdate.save();
    return true;
  }

  async deleteComment(_id: ObjectId): Promise<boolean> {
    const commentToDelete = await CommentModel.findOne({ _id });
    if (!commentToDelete) {
      return false;
    }
    await CommentModel.deleteOne({ _id });
    return true;
  }

  async getCommentById(_id: ObjectId): Promise<CommentDBModel | null> {
    const commentById = await CommentModel.findOne({ _id });

    if (!commentById) {
      return null;
    }
    return commentById;
  }
  async getCommentsByPostId(_id: string): Promise<CommentDBModel[] | null> {
    try {
      const commentsByPostId = await CommentModel.find({ postId: _id });
      if (!commentsByPostId) {
        return [];
      }
      return commentsByPostId;
    } catch (e) {
      return null;
    }
  }
}
