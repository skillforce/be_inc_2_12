import { Response, Router } from 'express';
import { AuthLoginDto } from '../types/types';
import { RequestWithBody, RequestWithParams } from '../../../common/types/request';
import { cookieHandler } from '../../../common/refreshToken/refreshToken';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { authService } from '../service/authService';
import { Request } from 'express';
import { ResultStatus } from '../../../common/result/resultCode';
import { authQueryRepository } from '../repository/authQueryRepository';
import { securityService } from '../service/securityService';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { checkIfDeviceIdWithProvidedQueryParamIdExists } from '../middlewares/authInputValidationMiddleware';

export const securityRouter = Router({});

securityRouter.get('/devices', async (req: Request, res: Response) => {
  const refreshToken = cookieHandler.getRefreshToken(req);

  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const isRefreshTokenValidResult = await authService.checkRefreshToken(refreshToken);

  if (isRefreshTokenValidResult.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  const sessions = await authQueryRepository.getAllSessions();

  res.status(HttpStatuses.Success).send(sessions);
});

securityRouter.delete('/devices', async (req: Request, res: Response) => {
  const refreshToken = cookieHandler.getRefreshToken(req);

  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  const removeResult = await securityService.removeAllUserSessionsExceptCurrentOne(refreshToken);
  if (removeResult.status !== ResultStatus.Success) {
    res.sendStatus(resultCodeToHttpException(removeResult.status));
    return;
  }
  res.sendStatus(HttpStatuses.NoContent);
});

securityRouter.delete(
  '/devices/:id',
  checkIfDeviceIdWithProvidedQueryParamIdExists,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const refreshToken = cookieHandler.getRefreshToken(req);
    const deviceId = req.params.id;

    if (!refreshToken) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }
    const removeResult = await securityService.removeSessionByDeviceId(refreshToken, deviceId);
    if (removeResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(removeResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);
