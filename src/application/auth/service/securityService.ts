import { Result } from '../../../common/result/result.type';
import { authService } from './authService';
import { ResultStatus } from '../../../common/result/resultCode';
import { authRepository } from '../repository/authRepository';

export const securityService = {
  async removeAllUserSessionsExceptCurrentOne(refreshToken: string): Promise<Result<boolean>> {
    const isRefreshTokenValidResult = await authService.checkRefreshToken(refreshToken);
    if (
      isRefreshTokenValidResult.status !== ResultStatus.Success ||
      !isRefreshTokenValidResult.data?.userId ||
      !isRefreshTokenValidResult.data?.deviceId
    ) {
      return {
        status: ResultStatus.Unauthorized,
        data: false,
        extensions: [],
      };
    }
    const removeResult = await authRepository.removeAllUserSessionsExceptCurrentOne(
      isRefreshTokenValidResult.data?.userId,
      isRefreshTokenValidResult.data?.deviceId,
    );
    if (!removeResult) {
      return {
        status: ResultStatus.ServerError,
        data: false,
        extensions: [{ field: 'Server Error', message: 'some server error occurred' }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  },
  async removeSessionByDeviceId(refreshToken: string, deviceId: string): Promise<Result<boolean>> {
    const isRefreshTokenValidResult = await authService.checkRefreshToken(refreshToken);

    const sessionByDeviceId = await authRepository.getSessionByDeviceId(deviceId);

    if (!sessionByDeviceId) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        extensions: [],
      };
    }
    if (
      isRefreshTokenValidResult.status !== ResultStatus.Success ||
      !isRefreshTokenValidResult.data?.userId
    ) {
      return {
        status: ResultStatus.Unauthorized,
        data: false,
        extensions: [],
      };
    }

    const isCurrentUserOwnSession =
      isRefreshTokenValidResult.data.userId === sessionByDeviceId.user_id;

    if (!isCurrentUserOwnSession) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        extensions: [],
      };
    }

    const removeSessionResult = await authRepository.removeSessionByDeviceId(deviceId);

    if (!removeSessionResult) {
      return {
        status: ResultStatus.ServerError,
        data: false,
        extensions: [{ field: 'Server Error', message: 'some server error occurred' }],
      };
    }
    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  },
};
