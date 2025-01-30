import { req, testApp } from './test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongo-db';
import { AddUserInputQueryRequiredData } from '../src/entities/users/types/types';
import { PATHS } from '../src/common/paths/paths';
import { testingDtosCreator } from './utils/testingDtosCreator';
import { createBlog } from './utils/createBlog';

const newUser = {
  email: 'testo@gmail.com',
  login: 'test123',
  password: 'Password1!',
} as AddUserInputQueryRequiredData;

const secondUser = {
  email: 'unique@gmail.com',
  login: 'unique',
  password: 'Password1!',
} as AddUserInputQueryRequiredData;

describe('/comments', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();

    await db.run(uri);
    await db.drop();
  }, 10000);

  it('should get empty array', async () => {
    const result = await createBlog(testApp);
    console.log(result);
  });
});
