import { Request, Response, Router } from 'express'
import { AddUserInputQueryRequiredData, UserDBOutputType, UsersOutputWithPagination } from "../types/types";
import { usersQueryRepository } from "../repository/usersQueryRepository";
import {
    addUserBodyValidators,
    deleteUserValidators,
    getUsersValidators
} from "../middlewares/usersInputDataValidationMiddleware";
import { ADD_USER_ERROR_CODES, usersService } from "../domain/usersService";
import { ErrorResponseObject } from "../../../common/helpers";

export const usersRouter = Router({});


usersRouter.get('/',
    getUsersValidators,
    async (req: Request, res: Response<UsersOutputWithPagination>) => {
        const queryObj = req.query;

        const responseData = await usersQueryRepository.getPaginatedUsers(queryObj as Record<string, string | undefined>)
        res.status(200).json(responseData);

    })

usersRouter.post('/',
    addUserBodyValidators,
    async (req: Request<any, any, AddUserInputQueryRequiredData>, res: Response<UserDBOutputType | ErrorResponseObject>) => {
        const {login, password, email} = req.body


        const {code, data} = await usersService.addUser({login, password, email})

        switch (code) {
            case ADD_USER_ERROR_CODES.NOT_CREATED:
                res.sendStatus(500);
                break;

            case ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE:
                res.status(400).json(data);
                break;

            case ADD_USER_ERROR_CODES.CREATED:
                const userById = await usersQueryRepository.getUserById(data.id);

                if (!userById) {
                    res.sendStatus(500);
                    break;
                }

                res.status(201).json(userById as UserDBOutputType);
                break;

            default:
                res.sendStatus(500);
                break;
        }
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
