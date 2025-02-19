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

const newUser2 = {
  email: 'tessss@gmail.com',
  login: 'sssssss',
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

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();

    expect(res.body.accessToken).toBeDefined();
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/refreshToken/);
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
      .set('Cookie', loginResponse.headers['set-cookie'][0])
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.accessToken).not.toMatch(loginResponse.body.accessToken);
    expect(refreshResponse.headers['set-cookie']).toBeDefined();
    expect(refreshResponse.headers['set-cookie'][0]).not.toMatch(
      loginResponse.headers['set-cookie'][0],
    );
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
  it('should return error when try to logout with invalid refresh token', async () => {
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
      .set('Cookie', loginResponse.headers['set-cookie'][0])
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .expect(200);

    await req
      .post(PATHS.AUTH.LOGOUT)
      .set('Cookie', 'refresh-token=frefrefrfrefrefrefre')
      .auth(refreshResponse.body.accessToken, { type: 'bearer' })
      .expect(401);
  });
  it('should return error when try to logout with invalid refresh token', async () => {
    await db.drop();
    await createUser({ userDto: newUser });

    const loginResponse = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .expect(200);

    await req
      .get(PATHS.AUTH.ME)
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .expect(200);
  });
  it('should login user from different devices', async () => {
    await db.drop();
    await createUser({ userDto: newUser });

    const loginResponseFirst = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/1.0')
      .expect(200);
    await delay(500);
    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/2.0')
      .expect(200);
    await delay(500);
    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/3.0')
      .expect(200);

    const result = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(loginResponseFirst.body.accessToken, { type: 'bearer' })
      .set('Cookie', loginResponseFirst.headers['set-cookie'][0])
      .expect(200);
    expect(result.body.items.length).toBe(3);
  });
  it('should return 429 error when there was more than 5 attempts to login from one IP', async () => {
    await db.drop();
    await createUser({ userDto: newUser });

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/1.0')
      .expect(200);

    await delay(500);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/1.0')
      .expect(200);

    await delay(500);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/1.0')
      .expect(200);

    await delay(500);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/2.0')
      .expect(200);

    await delay(500);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/3.0')
      .expect(200);

    await delay(500);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/3.0')
      .expect(429);
  });
  it('should return error when user tries to remove not his own session ', async () => {
    await db.drop();
    await createUser({ userDto: newUser });
    await createUser({ userDto: newUser2 });

    const loginResponseFirst = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.pass,
      })
      .set('User-Agent', 'CustomUserAgent/1.0')
      .expect(200);

    const loginResponseSecond = await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser2.login,
        password: newUser2.pass,
      })
      .set('User-Agent', 'CustomUserAgent/2.0')
      .expect(200);

    const activeSessionsResponse = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(loginResponseFirst.body.accessToken, { type: 'bearer' })
      .set('Cookie', loginResponseFirst.headers['set-cookie'][0])
      .expect(200);

    await req
      .delete(`${PATHS.SECURITY}/devices/${activeSessionsResponse.body[0].deviceId}`)
      .auth(loginResponseSecond.body.accessToken, { type: 'bearer' })
      .set('Cookie', loginResponseSecond.headers['set-cookie'][0])
      .expect(403);
  });
});
