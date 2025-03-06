import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { ObjectId, WithId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { inject, injectable } from 'inversify';

@injectable()
export class PostRepository {
  constructor(@inject(DataBase) protected database: DataBase) {}
  async addPost(newPostData: AddBlogDto): Promise<ObjectId | null> {
    const result = await this.database
      .getCollections()
      .postCollection.insertOne(newPostData as WithId<AddBlogDto>);

    if (!result.insertedId) {
      return null;
    }

    return result.insertedId;
  }

  async updatePost(
    _id: ObjectId,
    postDataForUpdates: AddUpdatePostRequiredInputData,
  ): Promise<boolean> {
    const result = await this.database.getCollections().postCollection.updateOne(
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
  }

  async deletePost(_id: ObjectId): Promise<boolean> {
    const result = await this.database.getCollections().postCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  }
}
