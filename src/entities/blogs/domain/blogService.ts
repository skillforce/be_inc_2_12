import { AddBlogDto, AddUpdateBlogRequiredInputData } from '../types/types';
import { blogRepository } from '../repository/blogRepository';
import { ObjectId } from 'mongodb';

import { toObjectId } from '../../../common/middlewares/helper';

export const blogService = {
  addBlog: async ({
    name,
    websiteUrl,
    description,
  }: AddUpdateBlogRequiredInputData): Promise<ObjectId | null> => {
    const newBlogData: AddBlogDto = {
      name,
      websiteUrl,
      description,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlogId = await blogRepository.addBlog(newBlogData);

    if (!createdBlogId) {
      return null;
    }

    return createdBlogId;
  },

  updateBlog: async (
    id: string,
    videoDataForUpdate: AddUpdateBlogRequiredInputData,
  ): Promise<boolean> => {
    const _id = toObjectId(id);
    if (!_id) {
      return false;
    }
    return await blogRepository.updateBlog(_id, videoDataForUpdate);
  },

  deleteBlog: async (id: string): Promise<boolean> => {
    const _id = toObjectId(id);

    if (!_id) {
      return false;
    }
    return await blogRepository.deleteBlog(_id);
  },
};
