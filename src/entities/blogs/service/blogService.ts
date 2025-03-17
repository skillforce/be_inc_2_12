import { AddUpdateBlogRequiredInputData } from '../types/types';
import { BlogRepository } from '../infrastructure/blogRepository';
import { ObjectId } from 'mongodb';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';
import { BlogModel } from '../domain/Blogs.entity';

@injectable()
export class BlogService {
  constructor(@inject(BlogRepository) protected blogRepository: BlogRepository) {}
  async addBlog({
    name,
    websiteUrl,
    description,
  }: AddUpdateBlogRequiredInputData): Promise<Result<ObjectId | null>> {
    const newBlogData = {
      name,
      websiteUrl,
      description,
      isMembership: false,
    };

    const newBlog = BlogModel.createBlog(newBlogData);

    await this.blogRepository.saveBlog(newBlog);

    return { status: ResultStatus.Success, data: newBlog._id, extensions: [] };
  }
  async updateBlog(
    id: string,
    updateBlogDTO: AddUpdateBlogRequiredInputData,
  ): Promise<Result<boolean>> {
    const blogForUpdate = await this.blogRepository.findBlogById(id);
    if (!blogForUpdate) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }

    await blogForUpdate.updateBlogBody(updateBlogDTO);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }

  async deleteBlog(id: string): Promise<Result<boolean>> {
    const blogToDelete = await this.blogRepository.findBlogById(id);

    if (!blogToDelete) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }
    await this.blogRepository.deleteBlog(blogToDelete);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }
}
