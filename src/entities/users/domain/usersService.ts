import { ObjectId } from "mongodb";
import { ErrorResponseObject, generateErrorResponseObject, toObjectId } from "../../../common/helpers";
import { usersRepository } from "../repository/usersRepository";
import { AddUserInputQueryRequiredData, AddUserRequestRequiredData } from "../types/types";

import { bcryptService } from "../../../common/adapters/bcrypt.service";

export enum ADD_USER_ERROR_CODES {
    CREATED = 1,
    LOGIN_OR_EMAIL_NOT_UNIQUE = 2,
    NOT_CREATED = 3
}


export type AddUserReturnValueType =
    | { code: ADD_USER_ERROR_CODES.CREATED; data: { id: ObjectId } }
    | { code: ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE; data: ErrorResponseObject }
    | { code: ADD_USER_ERROR_CODES.NOT_CREATED; data: null };


export const usersService = {
    addUser: async ({
                        login,
                        password,
                        email
                    }: AddUserInputQueryRequiredData): Promise<AddUserReturnValueType> => {


        const isLoginUnique = await usersRepository.isFieldValueUnique('login', login) //search by both fields login and email
        const isEmailUnique = await usersRepository.isFieldValueUnique('email', email)

        if (!isLoginUnique) {
            return {
                code: ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE,
                data: generateErrorResponseObject('login', 'login must be unique')
            }
        }

        if (!isEmailUnique) {
            return {
                code: ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE,
                data: generateErrorResponseObject('email', 'email must be unique')
            }
        }

        const hashedPassword = await bcryptService.generateHash(password)

        const newBlogData: AddUserRequestRequiredData = {
            login,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        const createdBlogId = await usersRepository.addUser(newBlogData)


        if (!createdBlogId) {
            return {code: ADD_USER_ERROR_CODES.NOT_CREATED, data: null}
        }

        return {code: ADD_USER_ERROR_CODES.CREATED, data: {id: createdBlogId}};
    },

    deleteUser: async (id: string): Promise<boolean> => {
        const _id = toObjectId(id)

        if (!_id) {
            return false;
        }
        return await usersRepository.deleteUser(_id)
    }
};