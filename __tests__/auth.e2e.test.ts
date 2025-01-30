import { req } from './test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AddUserInputQueryRequiredData } from '../src/entities/users/types/types';
import { PATHS } from '../src/common/paths/paths';
import { db } from '../src/db/mongo-db';

const newUser = {
  email: 'testo@gmail.com',
  login: 'test123',
  password: 'Password1!',
} as AddUserInputQueryRequiredData;

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
  it('should return 204 status code when there are correct loginOrEmail and password', async () => {
    await req
      .post(PATHS.USERS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(newUser)
      .expect(201);

    await req
      .post(PATHS.AUTH.LOGIN)
      .send({
        loginOrEmail: newUser.login,
        password: newUser.password,
      })
      .expect(204);
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
});
