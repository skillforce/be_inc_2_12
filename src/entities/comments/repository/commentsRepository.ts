import { AddUpdateCommentInputData, CommentDBModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { CommentModel } from './CommentSchema';

@injectable()
export class CommentsRepository {
  constructor() {}
  async addComment(newCommentData: Omit<CommentDBModel, '_id'>): Promise<ObjectId> {
    const result = await CommentModel.create(newCommentData);
    return result._id;
  }

  async updateComment(_id: ObjectId, dataForUpdate: AddUpdateCommentInputData): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { _id },
      {
        $set: {
          content: dataForUpdate.content,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deleteComment(_id: ObjectId): Promise<boolean> {
    const result = await CommentModel.deleteOne({ _id });
    return result.deletedCount === 1;
  }

  async getCommentById(_id: ObjectId): Promise<CommentDBModel | null> {
    const commentById = await CommentModel.findOne({ _id });

    if (!commentById) {
      return null;
    }
    return commentById;
  }
}
