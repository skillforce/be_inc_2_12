import { AddUpdateCommentInputData, CommentDBModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { CommentDocument, CommentModel } from '../domain/Comment.entity';
import { UserDocument } from '../../users/domain/User.entity';

@injectable()
export class CommentsRepository {
  constructor() {}

  async saveComment(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findById(_id: string): Promise<CommentDocument | null> {
    return CommentModel.findOne({ _id });
  }

  async deleteComment(comment: CommentDocument): Promise<void> {
    await comment.deleteOne();
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

  async getCommentsByPostId(_id: string): Promise<CommentDocument[] | null> {
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
