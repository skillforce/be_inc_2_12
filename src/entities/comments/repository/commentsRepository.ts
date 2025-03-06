import { AddUpdateCommentInputData, CommentDBModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { inject, injectable } from 'inversify';

@injectable()
export class CommentsRepository {
  constructor(@inject(DataBase) protected database: DataBase) {}
  async addComment(newCommentData: Omit<CommentDBModel, '_id'>): Promise<ObjectId> {
    const result = await this.database
      .getCollections()
      .commentsCollection.insertOne(newCommentData as CommentDBModel);
    return result.insertedId;
  }

  async updateComment(_id: ObjectId, dataForUpdate: AddUpdateCommentInputData): Promise<boolean> {
    const result = await this.database.getCollections().commentsCollection.updateOne(
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
    const result = await this.database.getCollections().commentsCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  }

  async getCommentById(_id: ObjectId): Promise<CommentDBModel | null> {
    const commentById = await this.database.getCollections().commentsCollection.findOne({ _id });

    if (!commentById) {
      return null;
    }
    return commentById;
  }
}
