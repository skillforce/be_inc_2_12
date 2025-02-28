import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../../src/db/mongo-db';
import { createUser, insertUser } from '../utils/userHelpers';
import { testingDtosCreator } from '../utils/testingDtosCreator';
import { mailService } from '../../src/common/adapters/mail.service';
import { emailServiceMock } from './mock/emailSendServiceMock';
import { authService } from '../../src/application/auth/service/authService';
import { ResultStatus } from '../../src/common/result/resultCode';
import { req } from '../utils/test-helpers';
import { PATHS } from '../../src/common/paths/paths';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { User } from '../../src/entities/users/service/user.entity';

describe('/auth', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.run(uri);
    await db.drop();
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
});
