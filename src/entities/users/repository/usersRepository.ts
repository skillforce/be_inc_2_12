import { db } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";
import { AddUserRequestRequiredData } from "../types/types";


export const usersRepository = {
    async addUser (newUserData: AddUserRequestRequiredData ): Promise<ObjectId> {
        const result = await db.getCollections().usersCollection
            .insertOne(newUserData as WithId<AddUserRequestRequiredData>)
        return result.insertedId;
    },
    isFieldValueUnique: async (field: string, value: string): Promise<boolean> => {
        const result = await db.getCollections().usersCollection.findOne({[field]: value})
        return !result;
    },
    async deleteUser(_id: ObjectId): Promise<boolean> {
        const result = await db.getCollections().usersCollection.deleteOne({_id})
        return result.deletedCount === 1;
    }

};