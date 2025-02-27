import { ObjectId, WithId } from 'mongodb';
import {
  GetPaginatedUsersQueryInterface,
  UserAuthViewModel,
  UserViewModel,
  UserDBModel,
  UsersOutputMapEnum,
} from '../types/types';
import { db } from '../../../db/mongo-db';
import { PaginatedData } from '../../../common/types/pagination';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';

export class UsersQueryRepository {
  async getUserById(
    _id: ObjectId,
    mapType: UsersOutputMapEnum = UsersOutputMapEnum.VIEW,
  ): Promise<UserViewModel | UserAuthViewModel | null> {
    const userById = await db.getCollections().usersCollection.findOne({ _id });

    if (!userById) {
      return null;
    }

    switch (mapType) {
      case UsersOutputMapEnum.VIEW:
        return this.mapUsersToOutput(userById);
      case UsersOutputMapEnum.AUTH:
        return this.mapUsersToAuthOutput(userById);
    }
  }

  async getPaginatedUsers(
    query: GetPaginatedUsersQueryInterface,
  ): Promise<PaginatedData<UserViewModel[]>> {
    const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

    const { pageNumber, pageSize, sortBy, sortDirection, searchEmailTerm, searchLoginTerm } =
      sanitizedQuery;
    const skip = (pageNumber - 1) * pageSize;

    const searchByEmailQuery = searchEmailTerm
      ? { email: { $regex: searchEmailTerm, $options: 'i' } }
      : null;
    const searchByLoginQuery = searchLoginTerm
      ? { login: { $regex: searchLoginTerm, $options: 'i' } }
      : null;

    const filter =
      searchByEmailQuery || searchByLoginQuery
        ? {
            $or: [
              ...(searchByEmailQuery ? [searchByEmailQuery] : []),
              ...(searchByLoginQuery ? [searchByLoginQuery] : []),
            ],
          }
        : {};

    const itemsFromDb = await db
      .getCollections()
      .usersCollection.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.countUsers(filter);
    const itemsForOutput = itemsFromDb.map(this.mapUsersToOutput);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: itemsForOutput,
    };
  }

  async countUsers(filter: Record<string, any>): Promise<number> {
    return db.getCollections().usersCollection.countDocuments(filter);
  }

  mapUsersToOutput(user: WithId<UserDBModel>): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
  mapUsersToAuthOutput(user: WithId<UserDBModel>): UserAuthViewModel {
    return {
      userId: user._id.toString(),
      login: user.login,
      email: user.email,
    };
  }
}
