import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { blogRepository } from '../repository/blogRepository';
import { ObjectId } from 'mongodb';

import { toObjectId } from '../../../common/helpers/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';

export const blogService = {
  addBlog: async ({
    name,
    websiteUrl,
    description,
  }: AddUpdateBlogRequiredInputData): Promise<Result<ObjectId | null>> => {
    const newBlogData: AddBlogDto = {
      name,
      websiteUrl,
      description,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlogId = await blogRepository.addBlog(newBlogData);

    if (!createdBlogId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return { status: ResultStatus.Success, data: createdBlogId, extensions: [] };
  },

  updateBlog: async (
    id: string,
    videoDataForUpdate: AddUpdateBlogRequiredInputData,
  ): Promise<Result<boolean>> => {
    const _id = toObjectId(id);
    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }
    const isBlogUpdated = await blogRepository.updateBlog(_id, videoDataForUpdate);
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
  },

  deleteBlog: async (id: string): Promise<Result<boolean>> => {
    const _id = toObjectId(id);

    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Blog not found',
        extensions: [],
      };
    }

    const isBlogDeleted = await blogRepository.deleteBlog(_id);

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
  },
};
