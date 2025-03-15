import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { PostModel } from '../domain/Post.entity';

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
    const postToUpdate = await PostModel.findOne({ _id });
    if (!postToUpdate) {
      return false;
    }
    postToUpdate.title = postDataForUpdates.title;
    postToUpdate.shortDescription = postDataForUpdates.shortDescription;
    postToUpdate.content = postDataForUpdates.content;
    await postToUpdate.save();
    return true;
  }

  async deletePost(_id: ObjectId): Promise<boolean> {
    const postToDelete = await PostModel.findOne({ _id });
    if (!postToDelete) {
      return false;
    }
    await postToDelete.deleteOne();
    return true;
  }
}
