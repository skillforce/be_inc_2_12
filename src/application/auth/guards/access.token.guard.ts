import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../../common/adapters/jwt.service';
import { IdType } from '../../../common/types/id';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { toObjectId } from '../../../common/helpers/helper';
import { UsersRepository } from '../../../entities/users/repository/usersRepository';

const usersRepository = new UsersRepository();

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const payload = await jwtService.verifyAccessToken(token);
  if (payload) {
    const { userId } = payload;

    if (!userId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    const doesUserExist = await usersRepository.findById(userId);

    if (!doesUserExist) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    req.user = { id: userId } as IdType;
    next();
    return;
  }
  res.sendStatus(HttpStatuses.Unauthorized);
};
