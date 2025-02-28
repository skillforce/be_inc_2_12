import { UsersQueryRepository } from '../../../entities/users/repository/usersQueryRepository';
import { AuthService } from '../service/authService';
import { RequestWithBody, RequestWithUserId } from '../../../common/types/request';
import { AuthLoginDto, RegisterUserDto } from '../types/types';
import { Request, Response } from 'express';
import { getClientInfo } from '../../../common/helpers/getClientInfoFromRequest';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { cookieHandler } from '../../../common/refreshToken/refreshToken';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { createErrorObject, toObjectId } from '../../../common/helpers/helper';
import { IdType } from '../../../common/types/id';
import { UsersOutputMapEnum } from '../../../entities/users';

export class AuthController {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected authService: AuthService,
  ) {}
  async loginUser(req: RequestWithBody<AuthLoginDto>, res: Response) {
    const { loginOrEmail, password } = req.body;

    const { userAgent, userIp } = getClientInfo(req) || {};

    const result = await this.authService.loginUser({
      loginOrEmail,
      password,
      device_name: userAgent,
      ip_address: userIp,
    });

    if (result.status !== ResultStatus.Success) {
      res.status(resultCodeToHttpException(result.status)).send(result.extensions);
      return;
    }
    cookieHandler.setRefreshToken(res, result.data!.refreshToken);
    res.status(HttpStatuses.Success).send({ accessToken: result.data!.accessToken });
  }

  async refreshToken(req: Request, res: Response) {
    const { sessionData } = req;

    const newTokensResult = await this.authService.refreshTokens(
      sessionData!.userId,
      sessionData!.deviceId,
    );
    if (newTokensResult.status !== ResultStatus.Success) {
      res.sendStatus(resultCodeToHttpException(newTokensResult.status));
      return;
    }

    cookieHandler.setRefreshToken(res, newTokensResult.data!.refreshToken);
    res.status(HttpStatuses.Success).send({ accessToken: newTokensResult.data!.accessToken });
  }

  async logout(req: Request, res: Response) {
    const { sessionData } = req;

    const result = await this.authService.removeSession(sessionData!.iat, sessionData!.deviceId);
    if (result.status !== ResultStatus.Success) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
  async registerUser(req: RequestWithBody<RegisterUserDto>, res: Response) {
    const registerUserDto = req.body;

    const result = await this.authService.registerUser(registerUserDto);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }

  async confirmRegistrationCode(req: RequestWithBody<{ code: string }>, res: Response) {
    const { code } = req.body;

    const result = await this.authService.confirmRegistrationCode(code);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async resendRegistrationEmail(req: RequestWithBody<{ email: string }>, res: Response) {
    const { email } = req.body;

    const result = await this.authService.resendConfirmationEmail(email);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async sendRecoveryPasswordEmail(req: RequestWithBody<{ email: string }>, res: Response) {
    const { email } = req.body;

    const result = await this.authService.sendRecoveryPasswordEmail(email);

    if (result.status !== ResultStatus.Success && result.status !== ResultStatus.NotFound) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async setNewPasswordByRecoveryCode(
    req: RequestWithBody<{ recoveryCode: string; newPassword: string }>,
    res: Response,
  ) {
    const { recoveryCode, newPassword } = req.body;

    const result = await this.authService.setNewPasswordByRecoveryCode(recoveryCode, newPassword);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  }

  async getMe(req: RequestWithUserId<IdType>, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    const userObjectId = toObjectId(userId);

    if (!userObjectId) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    const user = await this.usersQueryRepository.getUserById(userObjectId, UsersOutputMapEnum.AUTH);

    if (!user) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    res.status(HttpStatuses.Success).send(user);
  }
}
