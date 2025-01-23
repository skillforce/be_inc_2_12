import { ObjectId } from "mongodb";
import { toObjectId } from "../../../helpers/helpers";
import { usersRepository } from "../repository/usersRepository";
import { AddUserInputQueryRequiredData, AddUserRequestRequiredData } from "../types/types";
import { hashPasswordWithSalt } from "../../../helpers/authHelper";


export const usersService = {
    addUser: async ({
                        login,
                        password,
                        email
                    }: AddUserInputQueryRequiredData): Promise<ObjectId | null> => {

        const hashedPassword = await hashPasswordWithSalt(password)



        const newBlogData: AddUserRequestRequiredData = {
            login,
            email,
            password:hashedPassword,
            createdAt: new Date().toISOString(), // check that email and login are unique
        };

        const createdBlogId = await usersRepository.addUser(newBlogData)

        if (!createdBlogId) {
            return null;
        }

        return createdBlogId;
    },

    deleteUser: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if (!_id) {
            return false;
        }
        return await usersRepository.deleteUser(_id)
    },
};