import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { PostModel } from './PostScheme';

@injectable()
export class PostRepository {
  constructor() {}
  async addPost(newPostData: AddBlogDto): Promise<ObjectId | null> {
    const newPost = await PostModel.create(newPostData);

    if (!newPost._id) {
      return null;
    }

    return newPost._id;
  }

  async updatePost(
    _id: ObjectId,
    postDataForUpdates: AddUpdatePostRequiredInputData,
  ): Promise<boolean> {
    const result = await PostModel.updateOne(
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
    const result = await PostModel.deleteOne({ _id });
    return result.deletedCount === 1;
  }
}
