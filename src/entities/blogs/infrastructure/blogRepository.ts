import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { BlogDocument, BlogModel } from '../domain/Blogs.entity';
import { PostDocument, PostModel } from '../../posts/domain/Post.entity';

@injectable()
export class BlogRepository {
  constructor() {}

  async saveBlog(blogData: BlogDocument): Promise<void> {
    await blogData.save();
  }

  async findBlogById(id: string): Promise<BlogDocument | null> {
    return BlogModel.findOne({ _id: id });
  }

  // async deleteBlog(blogData: BlogDocument): Promise<void> {
  //   await blogData.deleteOne();
  // }

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
    const blog = await BlogModel.findById(_id);

    if (!blog) return false;

    blog.name = videoDataForUpdate.name;
    blog.websiteUrl = videoDataForUpdate.websiteUrl;
    blog.description = videoDataForUpdate.description;

    await blog.save();
    return true;
  }
  async getBlogById(_id: ObjectId): Promise<AddBlogDto | null> {
    const blogById = await BlogModel.findOne({ _id });
    if (!blogById) {
      return null;
    }
    return blogById;
  }
  async deleteBlog(_id: ObjectId): Promise<boolean> {
    const blog = await BlogModel.findById(_id);

    if (!blog) return false;

    await blog.deleteOne();
    return true;
  }
}
