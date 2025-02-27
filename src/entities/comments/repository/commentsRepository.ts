import { CommentDBModel, AddUpdateCommentInputData } from '../types/types';
import { ObjectId } from 'mongodb';
import { db } from '../../../db/mongo-db';

export class CommentsRepository {
  async addComment(newCommentData: Omit<CommentDBModel, '_id'>): Promise<ObjectId> {
    const result = await db
      .getCollections()
      .commentsCollection.insertOne(newCommentData as CommentDBModel);
    return result.insertedId;
  }

  async updateComment(_id: ObjectId, dataForUpdate: AddUpdateCommentInputData): Promise<boolean> {
    const result = await db.getCollections().commentsCollection.updateOne(
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
    const result = await db.getCollections().commentsCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  }

  async getCommentById(_id: ObjectId): Promise<CommentDBModel | null> {
    const commentById = await db.getCollections().commentsCollection.findOne({ _id });

    if (!commentById) {
      return null;
    }
    return commentById;
  }
}
