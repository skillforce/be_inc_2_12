import { Request, Response, Router } from 'express';
import { RequestWithParams } from '../../../common/types/request';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { authQueryRepository } from '../repository/authQueryRepository';
import { securityService } from '../service/securityService';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import {
  getDevicesByUserIdRequestValidators,
  removeSessionsByDeviceIdRequestValidators,
  removeSessionsRequestValidators,
} from '../middlewares/authInputValidationMiddleware';

export const securityRouter = Router({});

securityRouter.get(
  '/devices',
  getDevicesByUserIdRequestValidators,
  async (req: Request, res: Response) => {
    const { sessionData } = req;
    const sessions = await authQueryRepository.getAllSessionsForCurrentUser({
      userId: sessionData!.userId,
    });

    res.status(HttpStatuses.Success).send(sessions);
  },
);

securityRouter.delete(
  '/devices',
  removeSessionsRequestValidators,
  async (req: Request, res: Response) => {
    const { sessionData } = req;

    const removeResult = await securityService.removeAllUserSessionsExceptCurrentOne(
      sessionData!.userId,
      sessionData!.deviceId,
    );

    if (removeResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(removeResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);

securityRouter.delete(
  '/devices/:id',
  removeSessionsByDeviceIdRequestValidators,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const deviceId = req.params.id;
    const { sessionData } = req;

    const removeResult = await securityService.removeSessionByDeviceId(
      sessionData!.userId,
      deviceId,
    );
    if (removeResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(removeResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  },
);
