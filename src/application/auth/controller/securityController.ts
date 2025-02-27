import { AuthQueryRepository } from '../repository/authQueryRepository';
import { SecurityService } from '../service/securityService';
import { Request, Response } from 'express';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';

export class SecurityController {
  constructor(
    protected authQueryRepository: AuthQueryRepository,
    protected securityService: SecurityService,
  ) {}
  async getDevices(req: Request, res: Response) {
    const { sessionData } = req;
    const sessions = await this.authQueryRepository.getAllSessionsForCurrentUser({
      userId: sessionData!.userId,
    });

    res.status(HttpStatuses.Success).send(sessions);
  }

  async deleteDevices(req: Request, res: Response) {
    const { sessionData } = req;

    const removeResult = await this.securityService.removeAllUserSessionsExceptCurrentOne(
      sessionData!.userId,
      sessionData!.deviceId,
    );

    if (removeResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(removeResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }

  async deleteDeviceById(req: Request, res: Response) {
    const deviceId = req.params.id;
    const { sessionData } = req;

    const removeResult = await this.securityService.removeSessionByDeviceId(
      sessionData!.userId,
      deviceId,
    );
    if (removeResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(removeResult.status));
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
}
