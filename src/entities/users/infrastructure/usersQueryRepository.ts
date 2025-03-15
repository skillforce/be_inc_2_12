import { ObjectId, WithId } from 'mongodb';
import {
  GetPaginatedUsersQueryInterface,
  UserAuthViewModel,
  UserDBModel,
  UsersOutputMapEnum,
  UserViewModel,
} from '../types/types';
import { PaginatedData } from '../../../common/types/pagination';
import { queryFilterGenerator } from '../../../common/helpers/queryFilterGenerator';
import { injectable } from 'inversify';
import { UserModel } from '../domain/User.entity';

@injectable()
export class UsersQueryRepository {
  constructor() {}
  async getUserById(
    _id: ObjectId,
    mapType: UsersOutputMapEnum = UsersOutputMapEnum.VIEW,
  ): Promise<UserViewModel | UserAuthViewModel | null> {
    const userById = await UserModel.findOne({ _id });

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

    const searchFilter = UserModel.find();

    if (searchEmailTerm || searchLoginTerm) {
      const orConditions = [];
      if (searchEmailTerm) orConditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
      if (searchLoginTerm) orConditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
      searchFilter.or(orConditions);
    }

    const [itemsFromDb, totalCount] = await Promise.all([
      searchFilter
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      UserModel.countDocuments(searchFilter.getFilter()),
    ]);

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
    return UserModel.countDocuments(filter);
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
