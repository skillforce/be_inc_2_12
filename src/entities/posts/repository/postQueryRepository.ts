import { PostDBModel, PostViewModel } from '../types/types';
import { ObjectId } from 'mongodb';
import { db } from '../../../db/mongo-db';
import { PaginatedData } from '../../../common/types/pagination';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';

export const postQueryRepository = {
  async getPaginatedPosts(
    query: Record<string, string | undefined>,
    filter: Record<string, any> = {},
  ): Promise<PaginatedData<PostViewModel[]>> {
    const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

    const { pageNumber, pageSize, sortBy, sortDirection } = sanitizedQuery;
    const skip = (pageNumber - 1) * pageSize;

    const allPostsFromDb = await db
      .getCollections()
      .postCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.countPosts(filter);
    const itemsForOutput = allPostsFromDb.map(this.mapPostToOutput);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: itemsForOutput,
    };
  },
  async getPostById(_id: ObjectId): Promise<PostViewModel | null> {
    const postById = await db.getCollections().postCollection.findOne({ _id });
    if (!postById) {
      return null;
    }
    return this.mapPostToOutput(postById);
  },
  async countPosts(filter: Record<string, any>): Promise<number> {
    return db.getCollections().postCollection.countDocuments(filter);
  },

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
  },
};
