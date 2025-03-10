import { MongoMemoryServer } from 'mongodb-memory-server';
import { createUser, getUserFromDBByEmail, insertUser } from '../utils/userHelpers';
import { testingDtosCreator } from '../utils/testingDtosCreator';
import { mailService } from '../../src/common/adapters/mail.service';
import { emailServiceMock } from './mock/emailSendServiceMock';
import { AuthService } from '../../src/application/auth/service/authService';
import { ResultStatus } from '../../src/common/result/resultCode';
import { req } from '../utils/test-helpers';
import { PATHS } from '../../src/common/paths/paths';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { User } from '../../src/entities/users/service/user.entity';

import { AuthRepository } from '../../src/application/auth/repository/authRepository';
import { UsersRepository } from '../../src/entities/users/repository/usersRepository';
import { db } from '../../src/db/composition-root';

const authRepository = new AuthRepository();
const userRepository = new UsersRepository();
const authService = new AuthService(authRepository, userRepository);

describe('/auth', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.connect(uri);
    await db.clearDatabase();
  });

  beforeEach(async () => {
    mailService.sendEmail = jest.fn().mockImplementation(emailServiceMock.sendEmail);
  });

  it('should send email after user creation', async () => {
    const dto = testingDtosCreator.createUserDto({});

    const res = await authService.registerUser({
      login: dto.login,
      email: dto.email,
      password: dto.pass,
    });

    expect(res.status).toBe(ResultStatus.Success);
    expect(mailService.sendEmail).toBeCalled();
    expect(mailService.sendEmail).toBeCalledTimes(1);
  });
  it("should't resend email if user exists and already confirm his email", async () => {
    const user = await createUser({});

    const res = await authService.resendConfirmationEmail(user.email);

    expect(res.status).toBe(ResultStatus.BadRequest);
    expect(mailService.sendEmail).not.toBeCalled();
  });
  it("should resend email if user exists and didn't confirm his email", async () => {
    const userDto = testingDtosCreator.createUserDto({});
    await req
      .post(PATHS.AUTH.REGISTRATION)
      .send({
        login: userDto.login,
        email: userDto.email,
        password: userDto.pass,
      })
      .expect(HttpStatuses.NoContent);

    expect(mailService.sendEmail).toBeCalled();
    expect(mailService.sendEmail).toBeCalledTimes(1);

    await req
      .post(PATHS.AUTH.REGISTRATION_EMAIL_RESENDING)
      .send({ email: userDto.email })
      .expect(HttpStatuses.NoContent);

    expect(mailService.sendEmail).toBeCalled();
    expect(mailService.sendEmail).toBeCalledTimes(2);
  });
  it("should't resend email if user already confirmed it", async () => {
    const userDto = testingDtosCreator.createUserDto({});

    const mockUser = new User({
      login: userDto.login,
      email: userDto.email,
      hash: userDto.pass,
    });

    const userFromDB = await insertUser(mockUser);

    await req
      .post(PATHS.AUTH.CONFIRM_REGISTRATION)
      .send({ code: userFromDB.emailConfirmation.confirmationCode })
      .expect(HttpStatuses.NoContent);

    await req
      .post(PATHS.AUTH.REGISTRATION_EMAIL_RESENDING)
      .send({ email: userDto.email })
      .expect(HttpStatuses.BadRequest);
  });
  it('should send recover password email', async () => {
    const userDto = testingDtosCreator.createUserDto({});

    const mockUser = new User({
      login: userDto.login,
      email: userDto.email,
      hash: userDto.pass,
    });

    const userFromDB = await insertUser(mockUser);

    await req
      .post(PATHS.AUTH.PASSWORD_RECOVERY)
      .send({ email: userFromDB.email })
      .expect(HttpStatuses.NoContent);

    expect(mailService.sendEmail).toBeCalled();
    expect(mailService.sendEmail).toBeCalledTimes(1);

    const userFromDBAfterSendEmail = await getUserFromDBByEmail({ email: userFromDB.email });
    expect(userFromDBAfterSendEmail!.recoverPasswordEmailConfirmation).toBeDefined();

    await req
      .post(PATHS.AUTH.NEW_PASSWORD)
      .send({
        recoveryCode: userFromDBAfterSendEmail!.recoverPasswordEmailConfirmation!.confirmationCode,
        newPassword: 'newPassword',
      })
      .expect(HttpStatuses.NoContent);

    const userFromDBAfterPasswordRecovery = await getUserFromDBByEmail({ email: userFromDB.email });
    expect(userFromDBAfterPasswordRecovery!.password).not.toBe(userFromDBAfterSendEmail!.password);
  });
  it("shouldn't send email if email doesn't exist", async () => {
    const userDto = testingDtosCreator.createUserDto({});

    const mockUser = new User({
      login: userDto.login,
      email: userDto.email,
      hash: userDto.pass,
    });

    const userFromDB = await insertUser(mockUser);

    await req
      .post(PATHS.AUTH.PASSWORD_RECOVERY)
      .send({ email: 'fake@mail.ru' })
      .expect(HttpStatuses.NoContent);

    expect(mailService.sendEmail).not.toBeCalled();
  });
});
