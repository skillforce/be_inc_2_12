import { AddBlogDto, AddUpdatePostRequiredInputData } from '../types/types';
import { PostRepository } from '../infrastructure/postRepository';
import { ObjectId } from 'mongodb';
import { BlogViewModel } from '../../blogs/types/types';
import { toObjectId } from '../../../common/helpers/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';

@injectable()
export class PostService {
  constructor(@inject(PostRepository) protected postRepository: PostRepository) {}
  async addPost(
    { title, content, shortDescription }: Omit<AddUpdatePostRequiredInputData, 'blogId'>,
    blog: BlogViewModel,
  ): Promise<Result<ObjectId | null>> {
    const newPostData: AddBlogDto = {
      title,
      shortDescription,
      content,
      blogId: blog.id,
      blogName: blog?.name,
      createdAt: new Date().toISOString(),
    };

    const newPostId = await this.postRepository.addPost(newPostData);

    if (!newPostId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return { status: ResultStatus.Success, data: newPostId, extensions: [] };
  }

  async updatePost(
    id: ObjectId,
    blog: BlogViewModel,
    videoDataForUpdate: AddUpdatePostRequiredInputData,
  ): Promise<Result<boolean>> {
    const updatePostData = { ...videoDataForUpdate, blogId: blog.id, blogName: blog.name };

    const updatedPostId = await this.postRepository.updatePost(id, updatePostData);
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
  }

  async deletePost(id: string): Promise<Result<boolean>> {
    const _id = toObjectId(id);
    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }

    const isPostDeleted = await this.postRepository.deletePost(_id);

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
  }
}
