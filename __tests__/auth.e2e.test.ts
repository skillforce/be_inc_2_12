import { req } from './utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AddUserInputQueryRequiredData } from '../src/entities/users/types/types';
import { PATHS } from '../src/common/paths/paths';
import { db } from '../src/db/mongo-db';
import { createUser } from './utils/createUser';
import { UserDto } from './utils/testingDtosCreator';

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
    await createUser(newUser);

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
});
