import { Request, Response, Router } from 'express';
import { AuthLoginDto, RegisterUserDto } from '../types/types';
import {
  confirmRegistrationBodyValidators,
  loginBodyValidators,
  meRequestValidators,
  registrationBodyValidators,
  resendRegistrationEmailBodyValidators,
} from '../middlewares/authInputValidationMiddleware';
import { authService } from '../service/authService';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { RequestWithBody, RequestWithUserId } from '../../../common/types/request';
import { IdType } from '../../../common/types/id';
import { usersQueryRepository } from '../../../entities/users/repository/usersQueryRepository';
import { UsersOutputMapEnum } from '../../../entities/users';
import { createErrorObject, toObjectId } from '../../../common/helpers/helper';
import { cookieHandler } from '../../../common/refreshToken/refreshToken';
import { getClientInfo } from '../../../common/helpers/getClientInfoFromRequest';
import { delay } from '../../../../__tests__/utils/test-helpers';

export const authRouter = Router({});

authRouter.post(
  '/login',
  loginBodyValidators,
  async (req: RequestWithBody<AuthLoginDto>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const { userAgent, userIp } = getClientInfo(req) || {};

    const result = await authService.loginUser({
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
  },
);

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = cookieHandler.getRefreshToken(req);
  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  await delay(1000);
  const newTokensResult = await authService.refreshTokens(refreshToken);
  if (newTokensResult.status !== ResultStatus.Success) {
    res.sendStatus(resultCodeToHttpException(newTokensResult.status));
    return;
  }

  cookieHandler.setRefreshToken(res, newTokensResult.data!.refreshToken);
  res.status(HttpStatuses.Success).send({ accessToken: newTokensResult.data!.accessToken });
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = cookieHandler.getRefreshToken(req);
  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  const isTokenValidResult = await authService.checkRefreshToken(refreshToken);
  if (isTokenValidResult.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }
  const result = await authService.removeSession(refreshToken);
  if (result.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  res.sendStatus(HttpStatuses.NoContent);
});

authRouter.post(
  '/registration',
  registrationBodyValidators,
  async (req: RequestWithBody<RegisterUserDto>, res: Response) => {
    const registerUserDto = req.body;

    const result = await authService.registerUser(registerUserDto);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-confirmation',
  confirmRegistrationBodyValidators,
  async (req: RequestWithBody<{ code: string }>, res: Response) => {
    const { code } = req.body;

    const result = await authService.confirmRegistrationCode(code);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.post(
  '/registration-email-resending',
  resendRegistrationEmailBodyValidators,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    const { email } = req.body;

    const result = await authService.resendConfirmationEmail(email);

    if (result.status !== ResultStatus.Success) {
      const errorResponse = createErrorObject(result.extensions);
      res.status(HttpStatuses.BadRequest).send(errorResponse);
      return;
    }

    res.sendStatus(HttpStatuses.NoContent);
  },
);

authRouter.get(
  '/me',
  meRequestValidators,
  async (req: RequestWithUserId<IdType>, res: Response) => {
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

    const user = await usersQueryRepository.getUserById(userObjectId, UsersOutputMapEnum.AUTH);

    if (!user) {
      res.sendStatus(HttpStatuses.Unauthorized);
      return;
    }

    res.status(HttpStatuses.Success).send(user);
  },
);
