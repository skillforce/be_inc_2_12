import { ObjectId, WithId } from "mongodb";
import { queryFilterGenerator } from "../../../helpers/helpers";
import { UserDBOutputType, UserDBType, UsersOutputWithPagination } from "../types/types";
import { usersCollection } from "../../../db/mongo-db";

export const usersQueryRepository = {

    async getUserById(_id: ObjectId): Promise<UserDBOutputType | null> {
        const userById = await usersCollection.findOne({_id})

        if (!userById) {
            return null
        }
        return this.mapUsersToOutput(userById);
    },

    async getPaginatedUsers(
        query: Record<string, string | undefined>,
        additionalFilters: Record<string, any> = {}
    ): Promise<UsersOutputWithPagination> {

        const sanitizedQuery = queryFilterGenerator(query as Record<string, string | undefined>);

        const {pageNumber, pageSize, sortBy, sortDirection,searchEmailTerm, searchLoginTerm} = sanitizedQuery;
        const skip = (pageNumber - 1) * pageSize;
        const searchEmailText = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} : {}
        const searchLoginText = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} : {}
        const filter = {...searchEmailText, ...searchLoginText, ...additionalFilters}

        const itemsFromDb = await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await this.countUsers(filter);
        const itemsForOutput = itemsFromDb.map(this.mapUsersToOutput)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: itemsForOutput
        }

    },

    async countUsers(filter: Record<string, any>): Promise<number> {
        return usersCollection.countDocuments(filter);
    },

    mapUsersToOutput(user: WithId<UserDBType>): UserDBOutputType {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        }

    }
}