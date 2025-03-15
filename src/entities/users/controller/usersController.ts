import { UsersService } from '../service/usersService';
import { UsersQueryRepository } from '../infrastructure/usersQueryRepository';
import { RequestWithBody, RequestWithParams } from '../../../common/types/request';
import { CreateUserDto, GetPaginatedUsersQueryInterface, UserViewModel } from '../types/types';
import { Request, Response } from 'express';
import { PaginatedData } from '../../../common/types/pagination';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ErrorResponseObject } from '../../../common/helpers/helper';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { ObjectId } from 'mongodb';
import { inject } from 'inversify';

export class UsersController {
  constructor(
    @inject(UsersService) protected usersService: UsersService,
    @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async getUsers(
    req: RequestWithParams<GetPaginatedUsersQueryInterface>,
    res: Response<PaginatedData<UserViewModel[]>>,
  ) {
    const queryObj = req.query;

    const responseData = await this.usersQueryRepository.getPaginatedUsers(queryObj);
    res.status(HttpStatuses.Success).json(responseData);
  }
  async createUser(
    req: RequestWithBody<CreateUserDto>,
    res: Response<UserViewModel | ErrorResponseObject>,
  ) {
    const { login, password, email } = req.body;

    const result = await this.usersService.addUser({ login, password, email });

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

    const userById = await this.usersQueryRepository.getUserById(result.data as ObjectId);

    if (!userById) {
      res.sendStatus(HttpStatuses.ServerError);
      return;
    }

    res.status(HttpStatuses.Created).json(userById as UserViewModel);
  }
  async deleteUser(req: Request<{ id: string }>, res: Response<void>) {
    const queryId = req.params.id;
    const result = await this.usersService.deleteUser(queryId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.NotFound);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
}
