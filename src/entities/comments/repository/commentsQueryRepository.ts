import { ObjectId, WithId } from 'mongodb';
import { db } from '../../../db/mongo-db';
import { CommentViewModel, CommentDBModel } from '../types/types';
import { PaginatedData } from '../../../common/types/pagination';
import { SortQueryFieldsType } from '../../../common/types/sortQueryFieldsType';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';

export class CommentsQueryRepository {
  async getCommentById(_id: ObjectId): Promise<CommentViewModel | null> {
    const commentById = await db.getCollections().commentsCollection.findOne({ _id });

    if (!commentById) {
      return null;
    }
    return this.mapCommentToOutput(commentById);
  }
  async getPaginatedCommentsByPostId(
    query: SortQueryFieldsType,
    postId: ObjectId,
  ): Promise<PaginatedData<CommentViewModel[]>> {
    const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

    const { pageNumber, pageSize, sortBy, sortDirection } = sanitizedQuery;
    const skip = (pageNumber - 1) * pageSize;

    const filter = { postId };

    const allCommentsFromDb = await db
      .getCollections()
      .commentsCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.countComments(filter);
    const itemsForOutput = allCommentsFromDb.map(this.mapCommentToOutput);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: itemsForOutput,
    };
  }
  async countComments(filter: Record<string, any>): Promise<number> {
    return db.getCollections().commentsCollection.countDocuments(filter);
  }

  mapCommentToOutput(comment: WithId<CommentDBModel>): CommentViewModel {
    return {
      id: comment._id.toString(),
      commentatorInfo: comment.commentatorInfo,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  }
}
