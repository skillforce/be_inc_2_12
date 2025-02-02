import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { postRepository } from '../repository/postRepository';
import { ObjectId } from 'mongodb';
import { BlogViewModel } from '../../blogs/types/types';
import { toObjectId } from '../../../common/middlewares/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';

export const postService = {
  addPost: async (
    { title, content, shortDescription }: Omit<AddUpdatePostRequiredInputData, 'blogId'>,
    blog: BlogViewModel,
  ): Promise<Result<ObjectId | null>> => {
    const newPostData: AddBlogDto = {
      title,
      shortDescription,
      content,
      blogId: blog.id,
      blogName: blog?.name,
      createdAt: new Date().toISOString(),
    };

    const newPostId = await postRepository.addPost(newPostData);

    if (!newPostId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return { status: ResultStatus.Success, data: newPostId, extensions: [] };
  },

  updatePost: async (
    id: ObjectId,
    blog: BlogViewModel,
    videoDataForUpdate: AddUpdatePostRequiredInputData,
  ): Promise<Result<boolean>> => {
    const updatePostData = { ...videoDataForUpdate, blogId: blog.id, blogName: blog.name };

    const updatedPostId = await postRepository.updatePost(id, updatePostData);
    if (!updatedPostId) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  },

  deletePost: async (id: string): Promise<Result<boolean>> => {
    const _id = toObjectId(id);
    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }

    const isPostDeleted = await postRepository.deletePost(_id);

    if (!isPostDeleted) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  },
};
