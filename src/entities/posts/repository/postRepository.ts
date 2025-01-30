import { AddBlogRequestRequiredData, AddUpdatePostRequestRequiredData } from '../types/types';
import { ObjectId, WithId } from 'mongodb';
import { db } from '../../../db/mongo-db';

export const postRepository = {
  addPost: async (newPostData: AddBlogRequestRequiredData): Promise<ObjectId | null> => {
    const result = await db
      .getCollections()
      .postCollection.insertOne(newPostData as WithId<AddBlogRequestRequiredData>);

    if (!result.insertedId) {
      return null;
    }

    return result.insertedId;
  },

  updatePost: async (
    _id: ObjectId,
    postDataForUpdates: AddUpdatePostRequestRequiredData,
  ): Promise<boolean> => {
    const result = await db.getCollections().postCollection.updateOne(
      { _id },
      {
        $set: {
          title: postDataForUpdates.title,
          shortDescription: postDataForUpdates.shortDescription,
          content: postDataForUpdates.content,
        },
      },
    );
    return result.matchedCount === 1;
  },

  deletePost: async (_id: ObjectId): Promise<boolean> => {
    const result = await db.getCollections().postCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  },
};
