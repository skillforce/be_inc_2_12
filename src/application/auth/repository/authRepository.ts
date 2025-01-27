import { Filter } from "mongodb";
import { db } from "../../../db/mongo-db";
import { UserDBType } from "../../../entities/users";
import { LoginFilterSchema } from "../types/types";


export const authRepository = {
    getUserByFilter: async (filter:Filter<LoginFilterSchema>): Promise<UserDBType|null> => {
        return await db.getCollections().usersCollection.findOne(filter)
    },

};