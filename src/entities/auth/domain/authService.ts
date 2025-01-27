import { LoginBodyRequiredData } from "../types/types";
import { authRepository } from "../repository/authRepository";
import { bcryptService } from "../../../common/adapters/bcrypt.service";

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
            return bcryptService.checkPassword(password, user.password)
        }

        return false

    }

};