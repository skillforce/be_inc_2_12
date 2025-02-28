import { cleanDB, req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AddUserRequiredInputData } from '../../src/entities/users/types/types';
import { PATHS } from '../../src/common/paths/paths';
import { db } from '../../src/db/composition-root';

const newUser = {
  email: 'testo@gmail.com',
  login: 'test123',
  password: 'Password1!',
} as AddUserRequiredInputData;

const secondUser = {
  email: 'unique@gmail.com',
  login: 'unique',
  password: 'Password1!',
} as AddUserRequiredInputData;

describe('/users', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();

    await db.run(uri);
    await cleanDB();
  }, 10000);

  it('should get empty array', async () => {
    const res = await req
      .get(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(0);
  });
  it('should return error when there is no authorization header provided', async () => {
    await req.get(PATHS.USERS).expect(401);

    await req.post(PATHS.USERS).send(newUser).expect(401);

    await req.delete(PATHS.USERS + '/1').expect(401);
  });
  it('should create new user and get paginated array with new created user', async () => {
    await req
      .post(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(newUser)
      .expect(201);

    const res = await req
      .get(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return error when try to create user with non-uniq email', async () => {
    await req
      .post(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send({ ...newUser, login: secondUser.login })
      .expect(400);
  });
  it('should return error when try to create user with non-uniq login', async () => {
    await req
      .post(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send({ ...newUser, email: secondUser.email })
      .expect(400);
  });
  it('should create new user with uniq login and email', async () => {
    await req
      .post(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(secondUser)
      .expect(201);

    const res = await req
      .get(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(2);
  });
  it('should return users appropriate to query params property searchLoginTerm', async () => {
    const res = await req
      .get(PATHS.USERS)
      .query({ searchLoginTerm: newUser.login.slice(1) })
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return users appropriate to query params property searchEmailTerm', async () => {
    const res = await req
      .get(PATHS.USERS)
      .query({ searchEmailTerm: newUser.email.slice(1) })
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it(
    'should return both created users in case when searchLoginTerm ' +
      'is matched with first user login and searchEmailTerm is matched with second user email ',
    async () => {
      const res = await req
        .get(PATHS.USERS)
        .query({ searchLoginTerm: newUser.login.slice(1) })
        .query({ searchEmailTerm: secondUser.email.slice(1) })
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        .expect(200);

      expect(res.body.items.length).toBe(2);
    },
  );

  it('should remove user by provided id', async () => {
    const newUserId = await req
      .get(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => res.body.items[0].id);

    await req
      .delete(PATHS.USERS + '/' + newUserId)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(204);

    const res = await req
      .get(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200);

    expect(res.body.items.length).toBe(1);
  });
});
