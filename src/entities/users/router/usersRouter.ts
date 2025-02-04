import { Request, Response, Router } from 'express';
import {
  AddUserRequiredInputData,
  GetPaginatedUsersQueryInterface,
  UserViewModel,
} from '../types/types';
import { usersQueryRepository } from '../repository/usersQueryRepository';
import {
  addUserBodyValidators,
  deleteUserValidators,
  getUsersValidators,
} from '../middlewares/usersInputDataValidationMiddleware';
import { usersService } from '../service/usersService';
import { RequestWithBody, RequestWithParams } from '../../../common/types/request';
import { PaginatedData } from '../../../common/types/pagination';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ErrorResponseObject } from '../../../common/middlewares/helper';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { ObjectId } from 'mongodb';

export const usersRouter = Router({});

usersRouter.get(
  '/',
  getUsersValidators,
  async (
    req: RequestWithParams<GetPaginatedUsersQueryInterface>,
    res: Response<PaginatedData<UserViewModel[]>>,
  ) => {
    const queryObj = req.query;

    const responseData = await usersQueryRepository.getPaginatedUsers(queryObj);
    res.status(HttpStatuses.Success).json(responseData);
  },
);

usersRouter.post(
  '/',
  addUserBodyValidators,
  async (
    req: RequestWithBody<AddUserRequiredInputData>,
    res: Response<UserViewModel | ErrorResponseObject>,
  ) => {
    const { login, password, email } = req.body;

    const result = await usersService.addUser({ login, password, email });

    if (result.status === ResultStatus.BadRequest) {
      res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions as ErrorResponseObject['errorsMessages'] });
      return;
    }
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    const userById = await usersQueryRepository.getUserById(result.data as ObjectId);

    if (!userById) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).json(userById as UserViewModel);
  },
);

usersRouter.delete(
  '/:id',
  deleteUserValidators,
  async (req: Request<{ id: string }>, res: Response<void>) => {
    const queryId = req.params.id;
    const result = await usersService.deleteUser(queryId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);
