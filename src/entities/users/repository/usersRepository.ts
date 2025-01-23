import { usersCollection } from "../../../db/mongo-db";
import { ObjectId, WithId } from "mongodb";
import { AddUserRequestRequiredData } from "../types/types";


export const usersRepository = {
    async addUser (newUserData: AddUserRequestRequiredData ): Promise<ObjectId> {
        const result = await usersCollection
            .insertOne(newUserData as WithId<AddUserRequestRequiredData>)
        return result.insertedId;
    },

    async deleteUser(_id: ObjectId): Promise<boolean> {
        const result = await usersCollection.deleteOne({_id})
        return result.deletedCount === 1;
    }

};