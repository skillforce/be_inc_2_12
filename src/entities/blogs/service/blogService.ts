import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { BlogRepository } from '../infrastructure/blogRepository';
import { ObjectId } from 'mongodb';
import { toObjectId } from '../../../common/helpers/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';

@injectable()
export class BlogService {
  constructor(@inject(BlogRepository) protected blogRepository: BlogRepository) {}
  async addBlog({
    name,
    websiteUrl,
    description,
  }: AddUpdateBlogRequiredInputData): Promise<Result<ObjectId | null>> {
    const newBlogData: AddBlogDto = {
      name,
      websiteUrl,
      description,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlogId = await this.blogRepository.addBlog(newBlogData);

    if (!createdBlogId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return { status: ResultStatus.Success, data: createdBlogId, extensions: [] };
  }
  async checkIsBlogWithIdExist(id: string): Promise<Result<boolean>> {
    const _id = toObjectId(id);
    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }
    const blogsFromDb = await this.blogRepository.getBlogById(_id);
    if (!blogsFromDb) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }
    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }

  async updateBlog(
    id: string,
    videoDataForUpdate: AddUpdateBlogRequiredInputData,
  ): Promise<Result<boolean>> {
    const _id = toObjectId(id);
    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }
    const isBlogUpdated = await this.blogRepository.updateBlog(_id, videoDataForUpdate);
    if (!isBlogUpdated) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: isBlogUpdated,
      extensions: [],
    };
  }

  async deleteBlog(id: string): Promise<Result<boolean>> {
    const _id = toObjectId(id);

    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }

    const isBlogDeleted = await this.blogRepository.deleteBlog(_id);

    if (!isBlogDeleted) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: isBlogDeleted,
      extensions: [],
    };
  }
}
