import { BlogDbModel, BlogViewModel } from '../types/types';
import { ObjectId, WithId } from 'mongodb';
import { DataBase } from '../../../db/mongo-db';
import { PaginatedData } from '../../../common/types/pagination';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';
import { inject, injectable } from 'inversify';

@injectable()
export class BlogQueryRepository {
  constructor(@inject(DataBase) protected database: DataBase) {}

  async getPaginatedBlogs(
    query: Record<string, string | undefined>,
    additionalFilters: Record<string, any> = {},
  ): Promise<PaginatedData<BlogViewModel[]>> {
    const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = sanitizedQuery;
    const skip = (pageNumber - 1) * pageSize;
    const searchText = searchNameTerm ? { name: { $regex: searchNameTerm, $options: 'i' } } : {};
    const filter = { ...searchText, ...additionalFilters };

    const itemsFromDb = await this.database
      .getCollections()
      .blogCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.countBlogs(filter);
    const itemsForOutput = itemsFromDb.map(this.mapBlogToOutput);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: itemsForOutput,
    };
  }

  async getBlogById(_id: ObjectId): Promise<BlogViewModel | null> {
    const blogById = await this.database.getCollections().blogCollection.findOne({ _id });

    if (!blogById) {
      return null;
    }
    return this.mapBlogToOutput(blogById);
  }

  async countBlogs(filter: Record<string, any>): Promise<number> {
    return this.database.getCollections().blogCollection.countDocuments(filter);
  }
  mapBlogToOutput(blog: WithId<BlogDbModel>): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
