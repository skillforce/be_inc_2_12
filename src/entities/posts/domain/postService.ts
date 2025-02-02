import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { postRepository } from '../repository/postRepository';
import { ObjectId } from 'mongodb';
import { BlogViewModel } from '../../blogs/types/types';
import { toObjectId } from '../../../common/middlewares/helper';

export const postService = {
  addPost: async (
    { title, content, shortDescription }: Omit<AddUpdatePostRequiredInputData, 'blogId'>,
    blog: BlogViewModel,
  ): Promise<ObjectId | null> => {
    const newPostData: AddBlogDto = {
      title,
      shortDescription,
      content,
      blogId: blog.id,
      blogName: blog?.name,
      createdAt: new Date().toISOString(),
    };

    return await postRepository.addPost(newPostData);
  },

  updatePost: async (
    id: ObjectId,
    blog: BlogViewModel,
    videoDataForUpdate: AddUpdatePostRequiredInputData,
  ): Promise<boolean> => {
    const updatePostData = { ...videoDataForUpdate, blogId: blog.id, blogName: blog.name };

    return await postRepository.updatePost(id, updatePostData);
  },

  deletePost: async (id: string): Promise<boolean> => {
    const _id = toObjectId(id);
    if (!_id) {
      return false;
    }
    return await postRepository.deletePost(_id);
  },
};
