import { Request, Response, Router } from 'express'
import {
    AddUserInputQueryRequiredData,
    GetPaginatedUsersQueryInterface,
    UserDBOutputType
} from "../types/types";
import { usersQueryRepository } from "../repository/usersQueryRepository";
import {
    addUserBodyValidators,
    deleteUserValidators,
    getUsersValidators
} from "../middlewares/usersInputDataValidationMiddleware";
import { ADD_USER_ERROR_CODES, usersService } from "../domain/usersService";
import { ErrorResponseObject } from "../../../common/helpers";
import { RequestWithBody, RequestWithParams } from "../../../common/types/request";
import { PaginatedData } from "../../../common/types/pagination";
import { HttpStatuses } from "../../../common/types/httpStatuses";

export const usersRouter = Router({});


usersRouter.get('/',
    getUsersValidators,
    async (req: RequestWithParams<GetPaginatedUsersQueryInterface>, res: Response<PaginatedData<UserDBOutputType[]>>) => {
        const queryObj = req.query;

        const responseData = await usersQueryRepository.getPaginatedUsers(queryObj)
        res.status(HttpStatuses.Success).json(responseData);

    })

usersRouter.post('/',
    addUserBodyValidators,
    async (req: RequestWithBody<AddUserInputQueryRequiredData>, res: Response<UserDBOutputType | ErrorResponseObject>) => {
        const {login, password, email} = req.body


        const {code, data} = await usersService.addUser({login, password, email})

        switch (code) {
            case ADD_USER_ERROR_CODES.NOT_CREATED:
                res.sendStatus(HttpStatuses.ServerError);
                break;

            case ADD_USER_ERROR_CODES.LOGIN_OR_EMAIL_NOT_UNIQUE:
                res.status(HttpStatuses.BadRequest).json(data);
                break;

            case ADD_USER_ERROR_CODES.CREATED:
                const userById = await usersQueryRepository.getUserById(data.id);

                if (!userById) {
                    res.sendStatus(HttpStatuses.ServerError);
                    break;
                }

                res.status(HttpStatuses.Created).json(userById as UserDBOutputType);
                break;

            default:
                res.sendStatus(HttpStatuses.ServerError);
                break;
        }
    })


usersRouter.delete('/:id',
    deleteUserValidators,
    async (req: Request<{ id: string }>, res: Response<void>) => {

        const queryId = req.params.id
        const user = await usersService.deleteUser(queryId)
        if (!user) {
            res.sendStatus(HttpStatuses.NotFound)
            return;
        }
        res.sendStatus(HttpStatuses.NoContent)
    })
