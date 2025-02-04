import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../../src/db/mongo-db';
import { createUser } from '../utils/createUser';
import { req } from '../utils/test-helpers';
import { PATHS } from '../../src/common/paths/paths';
import { testingDtosCreator } from '../utils/testingDtosCreator';
import { nodemailerService } from '../../src/common/adapters/nodemailer.service';
import { emailServiceMock } from './mock/emailSendServiceMock';
import { authService } from '../../src/application/auth/service/authService';
import { ResultStatus } from '../../src/common/result/resultCode';

describe('/auth', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.run(uri);
    await db.drop();
  }, 10000);

  nodemailerService.sendEmail = jest.fn().mockImplementation(emailServiceMock.sendEmail);

  it('should send email after user creation', async () => {
    const dto = testingDtosCreator.createUserDto({});

    const res = await authService.registerUser({
      login: dto.login,
      email: dto.email,
      password: dto.pass,
    });

    expect(res.status).toBe(ResultStatus.Success);
    expect(nodemailerService.sendEmail).toBeCalled();
    expect(nodemailerService.sendEmail).toBeCalledTimes(1);
  });
});
