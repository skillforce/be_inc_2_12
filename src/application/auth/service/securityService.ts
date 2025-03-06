import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { AuthRepository } from '../repository/authRepository';
import { inject, injectable } from 'inversify';

@injectable()
export class SecurityService {
  constructor(@inject(AuthRepository) protected authRepository: AuthRepository) {}

  async removeAllUserSessionsExceptCurrentOne(
    userId: string,
    deviceId: string,
  ): Promise<Result<boolean>> {
    const removeResult = await this.authRepository.removeAllUserSessionsExceptCurrentOne(
      userId,
      deviceId,
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
  }
  async removeSessionByDeviceId(userId: string, deviceId: string): Promise<Result<boolean>> {
    const sessionByDeviceId = await this.authRepository.getSessionByDeviceId(deviceId);

    if (!sessionByDeviceId) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        extensions: [],
      };
    }

    const isCurrentUserOwnSession = userId === sessionByDeviceId.user_id;

    if (!isCurrentUserOwnSession) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        extensions: [],
      };
    }

    const removeSessionResult = await this.authRepository.removeSessionByDeviceId(deviceId);

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
  }
}
