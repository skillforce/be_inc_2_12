import { PostDBModel, PostViewModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { PaginatedData } from '../../../common/types/pagination';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';
import { inject, injectable } from 'inversify';
import { PostModel } from '../domain/Post.entity';

@injectable()
export class PostQueryRepository {
  constructor() {}
  async getPaginatedPosts(
    query: Record<string, string | undefined>,
    filter: Record<string, any> = {},
  ): Promise<PaginatedData<PostViewModel[]>> {
    const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

    const { pageNumber, pageSize, sortBy, sortDirection } = sanitizedQuery;
    const skip = (pageNumber - 1) * pageSize;

    const allPostsFromDb = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalCount = await this.countPosts(filter);
    const itemsForOutput = allPostsFromDb.map(this.mapPostToOutput);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: itemsForOutput,
    };
  }
  async getPostById(_id: ObjectId): Promise<PostViewModel | null> {
    const postById = await PostModel.findOne({ _id }).lean();
    if (!postById) {
      return null;
    }
    return this.mapPostToOutput(postById);
  }
  async countPosts(filter: Record<string, any>): Promise<number> {
    return PostModel.countDocuments(filter);
  }

  mapPostToOutput(post: PostDBModel): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
    };
  }
}
