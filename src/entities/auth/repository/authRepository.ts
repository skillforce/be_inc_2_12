import { Filter } from "mongodb";
import { usersCollection } from "../../../db/mongo-db";
import { UserDBType } from "../../users";
import { LoginFilterSchema } from "../types/types";


export const authRepository = {
    getUserByFilter: async (filter:Filter<LoginFilterSchema>): Promise<UserDBType|null> => {
        return await usersCollection.findOne(filter)
    },

};