import { req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PATHS } from '../../src/common/paths/paths';
import { db } from '../../src/db/mongo-db';
import { createUser } from '../utils/userHelpers';
import { UserDto } from '../utils/testingDtosCreator';

const newUser = {
  email: 'testo@gmail.com',
  login: 'test123',
  pass: 'Password1!',
} as UserDto;

describe('/login', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.run(uri);
    await db.drop();
  }, 10000);

  it('should return error code 400 if there is incorrect login request body', async () => {
    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: undefined,
        password: undefined,
      })
      .expect(400);
  });
  it('should return 200 status code when there are correct loginOrEmail and password', async () => {
    await createUser({ userDto: newUser });

    const res = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });
  it('should return 401 status code when there are incorrect loginOrEmail or password', async () => {
    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: 'assasas',
      })
      .expect(401);
  });
  it('should create user with appropriate schema and send email', async () => {
    const userCredentials = {
      login: 'testoTest',
      password: 'Password1!',
      email: 'testiki@mail.ru',
    };

    await req.post(PATHS.AUTH.REGISTRATION).send(userCredentials).expect(204);
  });
  it('should return error and error extension when register user with not uniq login or email', async () => {
    const userCredentials = {
      login: 'testoTest',
      password: 'Password1!',
      email: 'testiki@mail.ru',
    };

    const res = await req.post(PATHS.AUTH.REGISTRATION).send(userCredentials).expect(400);

    expect(res.body.errorsMessages).toBeDefined();
    expect(res.body.errorsMessages[0].field).toBe('login');
  });
  it('should return error and error body when try to resend email to unexisting user', async () => {
    const userCredentials = {
      email: 'test1223eiki@mail.ru',
    };

    const res = await req
      .post(PATHS.AUTH.REGISTRATION_EMAIL_RESENDING)
      .send(userCredentials)
      .expect(400);

    expect(res.body.errorsMessages).toBeDefined();
    expect(res.body.errorsMessages[0].field).toBe('email');
  });
  it('should return error when user try to verify email via unexisting code', async () => {
    const fakeCode = {
      code: 'fake_code',
    };

    const res = await req.post(PATHS.AUTH.CONFIRM_REGISTRATION).send(fakeCode).expect(400);
    console.log(res.body);
    expect(res.body.errorsMessages).toBeDefined();
    expect(res.body.errorsMessages[0].field).toBe('code');
  });
});
