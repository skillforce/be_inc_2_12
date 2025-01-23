import { Request, Response, Router } from 'express'
import { ObjectId } from "mongodb";
import { AddUserInputQueryRequiredData, UserDBOutputType, UsersOutputWithPagination } from "../types/types";
import { usersQueryRepository } from "../repository/usersQueryRepository";
import { addUserBodyValidators, deleteUserValidators } from "../middlewares/usersInputDataValidationMiddleware";
import { usersService } from "../domain/usersService";

export const usersRouter = Router({});


usersRouter.get('/', async (req: Request, res: Response<UsersOutputWithPagination>) => {
    const queryObj = req.query;

    const responseData = await usersQueryRepository.getPaginatedUsers(queryObj as Record<string, string | undefined>)
    res.status(200).json(responseData);

})

usersRouter.post('/',
    addUserBodyValidators,
    async (req: Request<any,any, AddUserInputQueryRequiredData>, res: Response<UserDBOutputType>) => {
        const {login,password,email} = req.body
        const newUserId = await usersService.addUser({login,password,email})

        if (!newUserId) {
            res.sendStatus(500)
            return;
        }
        const userById = await usersQueryRepository.getUserById(newUserId as ObjectId);

        if (!userById) {
            res.sendStatus(500)
            return;
        }

        res.status(201).json(userById as UserDBOutputType)
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
