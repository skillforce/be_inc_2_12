import { req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PATHS } from '../../src/common/paths/paths';
import { db } from '../../src/db/composition-root';

describe('/testing', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.connect(uri);
  }, 10000);
  it('should return 204 status ', async () => {
    await req.delete(PATHS.TESTING + '/all-data').expect(204);
  });
});
