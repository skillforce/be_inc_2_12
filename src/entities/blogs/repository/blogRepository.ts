import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { ObjectId, WithId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { inject, injectable } from 'inversify';
import { BlogModel } from './BlogsSchema';

@injectable()
export class BlogRepository {
  constructor() {}

  async addBlog(newBlogData: AddBlogDto): Promise<ObjectId | null> {
    const result = await BlogModel.create(newBlogData);
    if (!result._id) {
      return null;
    }
    return result._id;
  }

  async updateBlog(
    _id: ObjectId,
    videoDataForUpdate: AddUpdateBlogRequiredInputData,
  ): Promise<boolean> {
    const result = await BlogModel.updateOne(
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
    const blogById = await BlogModel.findOne({ _id });
    if (!blogById) {
      return null;
    }
    return blogById;
  }
  async deleteBlog(_id: ObjectId): Promise<boolean> {
    const result = await BlogModel.deleteOne({ _id });
    return result.deletedCount === 1;
  }
}
