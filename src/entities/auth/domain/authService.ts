import { LoginBodyRequiredData } from "../types/types";
import { comparePasswords, hashPasswordWithSalt } from "../../../helpers/authHelper";
import { authRepository } from "../repository/authRepository";

export const authService = {
    isUserExists: async ({loginOrEmail, password}: LoginBodyRequiredData): Promise<boolean> => {
        const loginFilter = {email: {$regex: loginOrEmail, $options: 'i'}}
        const emailFilter = {login: {$regex: loginOrEmail, $options: 'i'}}

        const filter = {
            $or:
                [
                    loginFilter,
                    emailFilter
                ]
        }

        const user = await authRepository.getUserByFilter(filter)

        if (user) {
            return comparePasswords(password, user.password)
        }

        return false

    }

};