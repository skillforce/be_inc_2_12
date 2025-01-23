import { Request, Response, Router } from 'express'
import { ObjectId } from "mongodb";
import { AddUserInputQueryRequiredData, UserDBOutputType, UsersOutputWithPagination } from "../types/types";
import { usersQueryRepository } from "../repository/usersQueryRepository";
import { addUserBodyValidators, deleteUserValidators } from "../middlewares/usersInputDataValidationMiddleware";
import { ADD_USER_ERROR_CODES, usersService } from "../domain/usersService";
import { ErrorResponseObject } from "../../../helpers/helpers";
import { usersRepository } from "../repository/usersRepository";

export const usersRouter = Router({});


usersRouter.get('/', async (req: Request, res: Response<UsersOutputWithPagination>) => {
    const queryObj = req.query;

    const responseData = await usersQueryRepository.getPaginatedUsers(queryObj as Record<string, string | undefined>)
    res.status(200).json(responseData);

})

usersRouter.post('/',
    addUserBodyValidators,
    async (req: Request<any, any, AddUserInputQueryRequiredData>, res: Response<UserDBOutputType | ErrorResponseObject>) => {
        const {login, password, email} = req.body


        const newUserData = await usersService.addUser({login, password, email})

        if (newUserData.code === ADD_USER_ERROR_CODES.NOT_CREATED) {
            res.sendStatus(500)
            return;
        }

        if (newUserData.code === ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE) {
            res.status(400).json(newUserData.data)
            return;
        }

        if (newUserData.code === ADD_USER_ERROR_CODES.CREATED) {
            const userById = await usersQueryRepository.getUserById(newUserData.data.id);

            if (!userById) {
                res.sendStatus(500)
                return;
            }
            res.status(201).json(userById as UserDBOutputType)
            return;
        }
        res.sendStatus(500)
    })


usersRouter.delete('/:id',
    deleteUserValidators,
    async (req: Request<{ id: string }>, res: Response<any>) => {

        const queryId = req.params.id
        const user = await usersService.deleteUser(queryId)
        if (!user) {
            res.sendStatus(404)
            return;
        }
        res.sendStatus(204)
    })
