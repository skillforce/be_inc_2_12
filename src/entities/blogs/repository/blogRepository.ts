import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { ObjectId, WithId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { inject, injectable } from 'inversify';

@injectable()
export class BlogRepository {
  constructor(@inject(DataBase) protected database: DataBase) {}

  async addBlog(newBlogData: AddBlogDto): Promise<ObjectId> {
    const result = await this.database
      .getCollections()
      .blogCollection.insertOne(newBlogData as WithId<AddBlogDto>);
    return result.insertedId;
  }

  async updateBlog(
    _id: ObjectId,
    videoDataForUpdate: AddUpdateBlogRequiredInputData,
  ): Promise<boolean> {
    const result = await this.database.getCollections().blogCollection.updateOne(
      { _id },
      {
        $set: {
          name: videoDataForUpdate.name,
          websiteUrl: videoDataForUpdate.websiteUrl,
          description: videoDataForUpdate.description,
        },
      },
    );
    return result.matchedCount === 1;
  }
  async getBlogById(_id: ObjectId): Promise<AddBlogDto | null> {
    const blogById = await this.database.getCollections().blogCollection.findOne({ _id });
    if (!blogById) {
      return null;
    }
    return blogById;
  }
  async deleteBlog(_id: ObjectId): Promise<boolean> {
    const result = await this.database.getCollections().blogCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  }
}
