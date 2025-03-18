import { UpdatePostDTO } from '../types/types';
import { PostRepository } from '../infrastructure/postRepository';
import { ObjectId } from 'mongodb';
import { BlogViewModel } from '../../blogs/types/types';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';
import { PostModel } from '../domain/Post.entity';
import { LikesRepository, LikeStatusEnum } from '../../likes';
import { LikeModel } from '../../likes/domain/Like.entity';

@injectable()
export class PostService {
  constructor(
    @inject(PostRepository) protected postRepository: PostRepository,
    @inject(LikesRepository) protected likesRepository: LikesRepository,
  ) {}
  async addPost(
    { title, content, shortDescription }: Omit<UpdatePostDTO, 'blogId'>,
    blog: BlogViewModel,
  ): Promise<Result<ObjectId | null>> {
    const newPost = PostModel.createPost({
      title,
      shortDescription,
      content,
      blogId: blog.id,
      blogName: blog?.name,
    });

    await this.postRepository.savePost(newPost);

    return { status: ResultStatus.Success, data: newPost._id, extensions: [] };
  }

  async updatePost(
    id: string,
    updatePostDTO: UpdatePostDTO & { blogName: string },
  ): Promise<Result<boolean>> {
    const postToUpdate = await this.postRepository.findPostById(id);
    if (!postToUpdate) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }
    await postToUpdate.updatePostBody(updatePostDTO);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<Result<boolean>> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Comment not found',
        extensions: [],
      };
    }

    const likeDocument = await this.likesRepository.findLikeByParentIdAndUserId(postId, userId);

    if (!likeDocument) {
      const newLike = LikeModel.createLike({
        userId,
        parentId: postId,
        likeStatus,
      });
      await this.likesRepository.saveLike(newLike);
      return {
        status: ResultStatus.Success,
        data: true,
        errorMessage: '',
        extensions: [],
      };
    }

    await likeDocument.updateStatus(likeStatus);

    return {
      status: ResultStatus.Success,
      data: true,
      errorMessage: '',
      extensions: [],
    };
  }

  async deletePost(id: string): Promise<Result<boolean>> {
    const postToDelete = await this.postRepository.findPostById(id);
    if (!postToDelete) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'Post not found',
        extensions: [],
      };
    }

    await this.postRepository.deletePost(postToDelete);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }
}
