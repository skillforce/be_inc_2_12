import { bcryptService } from '../../../common/adapters/bcrypt.service';
import { Result } from '../../../common/result/result.type';
import { UserDBModel, UserModel } from '../../../entities/users';
import { ResultStatus } from '../../../common/result/resultCode';
import { AuthLoginDto, SessionDto } from '../types/types';
import { jwtService } from '../../../common/adapters/jwt.service';
import { CreateUserDto } from '../../../entities/users/types/types';
import { authEmails } from '../../../common/layout/authEmails';
import { mailService } from '../../../common/adapters/mail.service';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { generateIsoStringFromSeconds } from '../../../common/helpers/helper';
import { AuthRepository } from '../repository/authRepository';
import { UsersRepository } from '../../../entities/users/infrastructure/usersRepository';
import { inject } from 'inversify';

enum EmailType {
  CONFIRM_EMAIL = 'confirmEmail',
  RECOVERY_PASSWORD = 'recoveryPassword',
}

export class AuthService {
  constructor(
    @inject(AuthRepository) protected authRepository: AuthRepository,
    @inject(UsersRepository) protected usersRepository: UsersRepository,
  ) {}
  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<UserDBModel | null>> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
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
  }

  async setNewPasswordByRecoveryCode(recoveryCode: string, newPassword: string) {
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode); //check is expired

    if (user?.recoverPasswordEmailConfirmation) {
      const { expirationDate, isConfirmed } = user.recoverPasswordEmailConfirmation;

      if (dayjs(expirationDate!).isBefore(dayjs()) || isConfirmed) {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: 'Bad Request',
          data: null,
          extensions: [{ field: 'code', message: 'Provided code is expired' }],
        };
      }

      const hashedPassword = await bcryptService.generateHash(newPassword);

      const userToChangePassword = await this.usersRepository.findByRecoveryCode(recoveryCode);

      if (!userToChangePassword) {
        return {
          status: ResultStatus.NotFound,
          errorMessage: 'User not found',
          data: null,
          extensions: [],
        };
      }

      await userToChangePassword.changePassword(hashedPassword);

      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    }
    return {
      status: ResultStatus.NotFound,
      data: null,
      errorMessage: 'User not found',
      extensions: [{ field: 'recoveryCode', message: 'Provided recovery code is incorrect.' }],
    };
  }

  async sendRecoveryPasswordEmail(email: string): Promise<Result> {
    const user = await this.usersRepository.findByLoginOrEmail(email);

    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'User not found',
        extensions: [],
      };
    }
    const newExpDate = dayjs().add(30, 'minute').toISOString();
    const newCode = randomUUID();

    await user.initializeRecoverPassword(newExpDate, newCode);

    if (!user.recoverPasswordEmailConfirmation?.confirmationCode) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    this.sendConfirmationEmail(
      user.email,
      user.recoverPasswordEmailConfirmation.confirmationCode,
      EmailType.RECOVERY_PASSWORD,
    );
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  async registerUser({ login, email, password }: CreateUserDto): Promise<Result> {
    const isCredentialsUnique = await UserModel.isEmailAndLoginUnique({
      email,
      login,
    });

    if (!isCredentialsUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Login and Email must be unique',
        extensions: [
          {
            field: 'login',
            message: 'Login must be unique',
          },
        ],
      };
    }

    const hashedPassword = await bcryptService.generateHash(password);
    const newUser = UserModel.createUser({ password: hashedPassword, login, email });

    await this.usersRepository.saveUser(newUser);

    this.sendConfirmationEmail(
      newUser.email,
      newUser.emailConfirmation.confirmationCode!,
      EmailType.CONFIRM_EMAIL,
    );

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
  sendConfirmationEmail(email: string, code: string, type: EmailType): void {
    const emailLayout =
      type === 'confirmEmail'
        ? authEmails.registrationEmail(code)
        : authEmails.passwordRecoveryEmail(code);
    mailService
      .sendEmail(email, emailLayout)
      .then()
      .catch((e) => console.log(e));
  }
  async resendConfirmationEmail(email: string): Promise<Result> {
    const user = await this.usersRepository.findByLoginOrEmail(email);

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

    await user.renewVerificationData({
      newExpirationDate: dayjs().add(30, 'minute').toISOString(),
      newCode: randomUUID(),
    });

    if (!user.emailConfirmation.confirmationCode) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }

    this.sendConfirmationEmail(
      user.email,
      user.emailConfirmation.confirmationCode,
      EmailType.CONFIRM_EMAIL,
    );
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
      errorMessage: '',
    };
  }
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

    const user = await this.usersRepository.findUserByRegistrationCode(code);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }

    const {
      emailConfirmation: { expirationDate, isConfirmed },
    } = user;

    if (dayjs(expirationDate).isBefore(dayjs()) || isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Provided code is expired' }],
      };
    }

    await user.confirmUserEmailById();

    return {
      status: ResultStatus.Success,
      errorMessage: '',
      data: null,
      extensions: [],
    };
  }

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
  }
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

    const result = await this.authRepository.updateRefreshTokenVersionByDeviceId({
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
  }
  async removeSession(iat: number, deviceId: string): Promise<Result<boolean>> {
    const refreshTokenIatIso = generateIsoStringFromSeconds(iat);
    const removeSessionResult = await this.authRepository.removeSession(
      deviceId,
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
  }
  async refreshTokens(
    userId: string,
    deviceId: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const newTokensResult = await this.generateTokens({
      userId,
      deviceId,
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
  async initializeSession(sessionBody: SessionDto): Promise<Result<string | null>> {
    const sessionId = await this.authRepository.addSession(sessionBody);
    if (!sessionId) {
      return {
        status: ResultStatus.ServerError,
        data: null,
        errorMessage: 'Internal server error occurred',
        extensions: [],
      };
    }
    const createdSession = await this.authRepository.getSessionById(sessionId);
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
  }
  async generateSessionBody(
    refreshToken: string,
    device_name?: string,
    ip_address?: string,
  ): Promise<Result<SessionDto | null>> {
    const decodedToken = await jwtService.decodeToken(refreshToken);

    if (
      decodedToken &&
      typeof decodedToken !== 'string' &&
      decodedToken.iat &&
      decodedToken.exp &&
      decodedToken.userId &&
      decodedToken.deviceId
    ) {
      return {
        status: ResultStatus.Success,
        data: {
          iat: generateIsoStringFromSeconds(decodedToken.iat),
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
  }
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
  }
}
