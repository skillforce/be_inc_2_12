import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../../common/adapters/jwt.service';
import { usersRepository } from '../../../entities/users/repository/usersRepository';
import { toObjectId } from '../../../common/helpers';
import { IdType } from '../../../common/types/id';
import { HttpStatuses } from '../../../common/types/httpStatuses';

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const [authType, token] = req.headers.authorization.split(' ')[1];

  if (authType !== 'Bearer') {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const payload = await jwtService.verifyToken(token);
  if (payload) {
    const { userId } = payload;

    const userObjectId = toObjectId(userId);

    if (!userObjectId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    const doesUserExist = await usersRepository.doesExistById(userObjectId);

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
