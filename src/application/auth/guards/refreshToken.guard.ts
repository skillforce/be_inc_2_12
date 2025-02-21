import { cookieHandler } from '../../../common/refreshToken/refreshToken';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../../common/adapters/jwt.service';
import { authRepository } from '../repository/authRepository';
import { generateIsoStringFromSeconds } from '../../../common/helpers/helper';
import { IdType } from '../../../common/types/id';

export const checkRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = cookieHandler.getRefreshToken(req);

  if (!refreshToken) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const verificationResult = await jwtService.verifyRefreshToken(refreshToken);
  if (!verificationResult) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const refreshTokenVersion = await jwtService.getRefreshTokenVersion(refreshToken);

  if (!refreshTokenVersion) {
    res.sendStatus(HttpStatuses.Unauthorized);
    return;
  }

  const deviceSession = await authRepository.getSessionByDeviceId(verificationResult.deviceId);
  const refreshTokenIatIso = generateIsoStringFromSeconds(+refreshTokenVersion);
  const decodedRefreshToken = await jwtService.decodeToken(refreshToken);

  if (
    deviceSession &&
    refreshTokenIatIso === deviceSession.iat &&
    decodedRefreshToken?.deviceId &&
    decodedRefreshToken?.userId &&
    decodedRefreshToken?.iat
  ) {
    req.sessionData = {
      deviceId: decodedRefreshToken.deviceId,
      userId: decodedRefreshToken.userId,
      iat: decodedRefreshToken.iat,
    };
    next();
    return;
  }
  res.sendStatus(HttpStatuses.Unauthorized);
  return;
};
