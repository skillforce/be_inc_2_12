import { delay, req } from '../utils/test-helpers';
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
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken/);
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
    expect(res.body.errorsMessages).toBeDefined();
    expect(res.body.errorsMessages[0].field).toBe('code');
  });
  it('should refresh tokens', async () => {
    await db.drop();
    await createUser({ userDto: newUser });

    const loginResponse = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .expect(200);

    await delay(1000);

    const refreshResponse = await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .set('Cookie', loginResponse.headers['set-cookie'])
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .expect(200);

    console.log(refreshResponse.body.accessToken === loginResponse.body.accessToken);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.accessToken).not.toEqual(loginResponse.body.accessToken);
    expect(refreshResponse.headers['set-cookie']).toBeDefined();
    expect(refreshResponse.headers['set-cookie'][0]).toMatch(/refreshToken/);
  });
  // it("shouldn't return user info if accessToken is expired", async () => {
  //   await db.drop();
  //   await createUser({ userDto: newUser });
  //
  //   const loginResponse = await req
  //     .post(PATHS.AUTH.LOGIN)
  //     .send({
  //       loginOrEmail: newUser.login,
  //       password: newUser.pass,
  //     })
  //     .expect(200);
  //   await delay(10000);
  //   await req
  //     .get(PATHS.AUTH.ME)
  //     .auth(loginResponse.body.accessToken, { type: 'bearer' })
  //     .expect(401);
  // }, 12000);
  it('should add refresh token in black list after logout', async () => {
    await db.drop();
    await createUser({ userDto: newUser });

    const loginResponse = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .expect(200);

    const refreshTokenResponse = await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .set('Cookie', loginResponse.headers['set-cookie'])
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .expect(200);

    await req
      .post(PATHS.AUTH.LOGOUT)
      .set('Cookie', refreshTokenResponse.headers['set-cookie'])
      .auth(refreshTokenResponse.body.accessToken, { type: 'bearer' })
      .expect(204);

    await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .set('Cookie', refreshTokenResponse.headers['set-cookie'])
      .auth(refreshTokenResponse.body.accessToken, { type: 'bearer' })
      .expect(401);
  });
});
