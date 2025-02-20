import { bcryptService } from '../../../common/adapters/bcrypt.service';
import { Result } from '../../../common/result/result.type';
import { UserDBModel } from '../../../entities/users';
import { usersRepository } from '../../../entities/users/repository/usersRepository';
import { ResultStatus } from '../../../common/result/resultCode';
import { AuthLoginDto, SessionDto } from '../types/types';
import { jwtService } from '../../../common/adapters/jwt.service';
import { AddUserDto, AddUserRequiredInputData } from '../../../entities/users/types/types';
import { authEmails } from '../../../common/layout/authEmails';
import { nodemailerService } from '../../../common/adapters/nodemailer.service';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { User } from '../../../entities/users/service/user.entity';
import { authRepository } from '../repository/authRepository';
import { v4 } from 'uuid';
import {
  generateIsoStringFromSeconds,
  nanosecondsStringToISOString,
} from '../../../common/helpers/helper';

export const authService = {
  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<UserDBModel | null>> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'User not found',
        extensions: [
          {
            field: 'loginOrEmail',
            message: 'Wrong password or email',
          },
        ],
      };
    }

    const isPassCorrect = await bcryptService.checkPassword(password, user.password);

    if (!isPassCorrect) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Incorrect password',
        extensions: [
          {
            field: 'password',
            message: 'Wrong password or email',
          },
        ],
      };
    }

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },

  async registerUser({ login, email, password }: AddUserRequiredInputData): Promise<Result> {
    const isLoginUnique = await usersRepository.isFieldValueUnique('login', login);
    const isEmailUnique = await usersRepository.isFieldValueUnique('email', email);

    if (!isLoginUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Login must be unique',
        extensions: [
          {
            field: 'login',
            message: 'Login must be unique',
          },
        ],
      };
    }

    if (!isEmailUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Email must be unique',
        extensions: [
          {
            field: 'email',
            message: 'Email must be unique',
          },
        ],
      };
    }

    const hashedPassword = await bcryptService.generateHash(password);

    const newUser: AddUserDto = new User({
      login: login,
      email: email,
      hash: hashedPassword,
    });

    const createdUserId = await usersRepository.addUser(newUser);

    if (!createdUserId) {
      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal server error occurred',
        data: null,
        extensions: [],
      };
    }

    this.sendConfirmationEmail(newUser.email, newUser.emailConfirmation.confirmationCode);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
  sendConfirmationEmail(email: string, code: string): void {
    const emailLayout = authEmails.registrationEmail(code);
    nodemailerService
      .sendEmail(email, emailLayout)
      .then()
      .catch((e) => console.log(e));
  },
  async resendConfirmationEmail(email: string): Promise<Result> {
    const user = await usersRepository.findByLoginOrEmail(email);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'User not found',
        extensions: [{ field: 'email', message: 'User not found' }],
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'User already confirmed',
        extensions: [{ field: 'email', message: 'User already confirmed' }],
      };
    }

    const newExpDate = dayjs().add(30, 'minute').toISOString();
    const newCode = randomUUID();

    const isCodeSent = await usersRepository.renewVerificationData(user._id, newExpDate, newCode);

    if (!isCodeSent) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    this.sendConfirmationEmail(user.email, newCode);
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
      errorMessage: '',
    };
  },
  async confirmRegistrationCode(code: string): Promise<Result> {
    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(code);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }

    const userByCodeResult = await usersRepository.getUserByRegistrationCode(code);

    if (!userByCodeResult) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }

    const {
      _id,
      emailConfirmation: { expirationDate, isConfirmed },
    } = userByCodeResult;

    if (dayjs(expirationDate).isBefore(dayjs()) || isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Provided code is expired' }],
      };
    }

    const isCodeConfirmed = await usersRepository.confirmUserEmailById(_id);

    if (!isCodeConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: '', message: 'Internal server error occurred' }],
      };
    }

    return {
      status: ResultStatus.Success,
      errorMessage: '',
      data: null,
      extensions: [],
    };
  },
  async generateTokens({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId?: string;
  }): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId);
    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken },
      extensions: [],
    };
  },
  async updateRefreshTokenVersion({
    newRefreshToken,
  }: {
    newRefreshToken: string;
  }): Promise<Result> {
    const refreshTokenSessionBodyResult = await this.generateSessionBody(newRefreshToken);

    if (!refreshTokenSessionBodyResult.data) {
      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal server error occurred',
        data: null,
        extensions: [],
      };
    }
    const { iat, exp, device_id } = refreshTokenSessionBodyResult.data;

    const result = await authRepository.updateRefreshTokenVersionByDeviceId({
      device_id,
      newVersionIat: iat,
      newVersionExp: exp,
    });
    if (!result) {
      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal server error occurred',
        data: null,
        extensions: [
          { field: 'updateRefreshTokenVersion', message: 'Internal server error occurred' },
        ],
      };
    }
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
  async checkRefreshToken(
    refreshToken: string,
  ): Promise<Result<null | { userId: string; deviceId: string; iat_ns: string }>> {
    const result = await jwtService.verifyRefreshToken(refreshToken);
    if (!result) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      };
    }
    const refreshTokenVersion = await jwtService.getRefreshTokenVersion(refreshToken);

    if (!refreshTokenVersion) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      };
    }

    const isoStringRefreshTokenVersion = nanosecondsStringToISOString(refreshTokenVersion);
    const deviceSession = await authRepository.getSessionByDeviceId(result.deviceId);

    if (deviceSession && isoStringRefreshTokenVersion === deviceSession.iat) {
      return {
        status: ResultStatus.Success,
        data: { userId: result.userId, deviceId: result.deviceId, iat_ns: refreshTokenVersion },
        extensions: [],
      };
    }
    return {
      status: ResultStatus.Unauthorized,
      data: null,
      errorMessage: 'Unauthorized',
      extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
    };
  },
  async removeSession(refreshToken: string): Promise<Result<boolean>> {
    const refreshTokenVersion = await jwtService.getRefreshTokenVersion(refreshToken);
    const refreshTokenDeviceId = await jwtService.getRefreshTokenDeviceId(refreshToken);

    if (!refreshTokenVersion || !refreshTokenDeviceId) {
      return {
        status: ResultStatus.Unauthorized,
        data: false,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      };
    }
    const refreshTokenIatIso = generateIsoStringFromSeconds(+refreshTokenVersion);
    const removeSessionResult = await authRepository.removeSession(
      refreshTokenDeviceId,
      refreshTokenIatIso,
    );
    if (!removeSessionResult) {
      return {
        status: ResultStatus.ServerError,
        data: false,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  },
  async refreshTokens(
    refreshToken: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const isRefreshTokenValidResult = await this.checkRefreshToken(refreshToken);
    if (isRefreshTokenValidResult.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
      };
    }

    if (isRefreshTokenValidResult.data?.userId && isRefreshTokenValidResult.data?.deviceId) {
      const newTokensResult = await this.generateTokens({
        userId: isRefreshTokenValidResult.data?.userId as string,
        deviceId: isRefreshTokenValidResult.data?.deviceId as string,
      });
      if (newTokensResult.status !== ResultStatus.Success) {
        return {
          status: ResultStatus.ServerError,
          data: null,
          errorMessage: 'Internal server error occurred',
          extensions: [],
        };
      }

      const { refreshToken: newRefreshToken } = newTokensResult.data;
      const updateRefreshTokenVersionResult = await this.updateRefreshTokenVersion({
        newRefreshToken: newRefreshToken,
      });
      if (updateRefreshTokenVersionResult.status !== ResultStatus.Success) {
        return {
          status: ResultStatus.ServerError,
          data: null,
          errorMessage: 'Internal server error occurred',
          extensions: [],
        };
      }
      return {
        status: ResultStatus.Success,
        data: newTokensResult.data,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Unauthorized,
      data: null,
      errorMessage: 'Unauthorized',
      extensions: [{ field: 'refreshToken', message: 'Unauthorized' }],
    };
  },
  async initializeSession(sessionBody: SessionDto): Promise<Result<string | null>> {
    const sessionId = await authRepository.addSession(sessionBody);
    if (!sessionId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }
    const createdSession = await authRepository.getSessionById(sessionId);
    if (!createdSession) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }
    return {
      status: ResultStatus.Success,
      data: createdSession.device_id,
      extensions: [],
    };
  },
  async generateSessionBody(
    refreshToken: string,
    device_name?: string,
    ip_address?: string,
  ): Promise<Result<SessionDto | null>> {
    const decodedToken = await jwtService.decodeToken(refreshToken);

    if (
      decodedToken &&
      typeof decodedToken !== 'string' &&
      decodedToken.iat_ns &&
      decodedToken.exp &&
      decodedToken.userId &&
      decodedToken.deviceId
    ) {
      return {
        status: ResultStatus.Success,
        data: {
          iat: nanosecondsStringToISOString(decodedToken.iat_ns),
          user_id: decodedToken.userId,
          exp: generateIsoStringFromSeconds(decodedToken.exp),
          device_id: decodedToken.deviceId,
          device_name: device_name ?? 'N/A',
          ip_address: ip_address ?? 'N/A',
        },
        extensions: [],
      };
    }

    return {
      status: ResultStatus.ServerError,
      data: null,
      errorMessage: 'JWT service error',
      extensions: [{ field: 'refreshToken', message: 'JWT service error' }],
    };
  },
  async loginUser({
    loginOrEmail,
    password,
    device_name,
    ip_address,
  }: AuthLoginDto): Promise<
    Result<{ accessToken: string; refreshToken: string; device_id: string } | null>
  > {
    const result = await this.checkUserCredentials(loginOrEmail, password);
    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong password or email' }],
      };
    }

    const generateTokensResult = await this.generateTokens({ userId: result.data!._id.toString() });

    if (generateTokensResult.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }
    const { accessToken, refreshToken } = generateTokensResult.data!;
    const sessionBody = await this.generateSessionBody(refreshToken, device_name, ip_address);

    if (sessionBody.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    const initializeSessionResult = await this.initializeSession(sessionBody.data!);

    if (initializeSessionResult.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken, device_id: initializeSessionResult.data! },
      extensions: [],
    };
  },
};
