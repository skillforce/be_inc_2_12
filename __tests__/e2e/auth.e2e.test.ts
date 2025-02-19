import { delay, req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PATHS } from '../../src/common/paths/paths';
import { db } from '../../src/db/mongo-db';
import { createAndLoginUser, createUser } from '../utils/userHelpers';
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
    await createAndLoginUser();
    await delay(500);
    await createAndLoginUser();
    await delay(500);
    await createAndLoginUser();
    await delay(500);
    await createAndLoginUser();
    await delay(500);
    await createAndLoginUser();
    await delay(500);
    await createUser({ userDto: newUser });
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
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();

    const activeSessionsResponse = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    await req
      .delete(`${PATHS.SECURITY}/devices/${activeSessionsResponse.body[0].deviceId}`)
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', secondUser.headers['set-cookie'][0])
      .expect(403);
  });
  it('should remove session info when logout properly ', async () => {
    await db.drop();
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();
    await createAndLoginUser();
    await createAndLoginUser();

    const activeSessions = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessions.body.length).toBe(4);

    await req
      .post(PATHS.AUTH.LOGOUT)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(204);

    const activeSessionsAfterLogout = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', secondUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessionsAfterLogout.body.length).toBe(3);
  });
  it('should refresh session iat and exp when refresh token', async () => {
    await db.drop();
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();
    await createAndLoginUser();
    await createAndLoginUser();

    const activeSessions = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessions.body.length).toBe(4);

    await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    const activeSessionsAfterRefresh = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', secondUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessionsAfterRefresh.body.length).toBe(4);
    expect(activeSessions.body[0].deviceId).toEqual(activeSessionsAfterRefresh.body[0].deviceId);
    expect(activeSessions.body[1].deviceId).toEqual(activeSessionsAfterRefresh.body[1].deviceId);
    expect(activeSessions.body[2].deviceId).toEqual(activeSessionsAfterRefresh.body[2].deviceId);
    expect(activeSessions.body[3].deviceId).toEqual(activeSessionsAfterRefresh.body[3].deviceId);
  });
  it('should remove session from db list', async () => {
    await db.drop();
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();

    const activeSessions = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessions.body.length).toBe(2);

    const updatedFirstUser = await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    await req
      .delete(`${PATHS.SECURITY}/devices/${activeSessions.body[0].deviceId}`)
      .auth(updatedFirstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', updatedFirstUser.headers['set-cookie'][0])
      .expect(204);

    const activeSessionsAfterRemoving = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', secondUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessionsAfterRemoving.body.length).toBe(1);
  });
  it('should return error when user logout with expired refresh token', async () => {
    await db.drop();
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();
    await delay(1000);
    const refreshedFirstUser = await req
      .post(PATHS.AUTH.REFRESH_TOKEN)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', firstUser.headers['set-cookie'][0])
      .expect(200);

    const activeSessions = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(refreshedFirstUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', refreshedFirstUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessions.body.length).toBe(2);

    await req.post(PATHS.AUTH.LOGOUT).set('Cookie', firstUser.headers['set-cookie'][0]).expect(401);

    const activeSessionsAfterLogout = await req
      .get(`${PATHS.SECURITY}/devices`)
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .set('Cookie', secondUser.headers['set-cookie'][0])
      .expect(200);

    expect(activeSessionsAfterLogout.body.length).toBe(2);
  });
});
