import { req } from './test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongo-db';
import { PATHS } from '../src/common/paths/paths';

describe('/testing', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.run(uri);
    await db.drop();
  }, 10000);
  it('should return 204 status ', async () => {
    await req.delete(PATHS.TESTING + '/all-data').expect(204);
    const postCollectionArray = await db.getCollections().postCollection.find().toArray();
    const blogCollectionArray = await db.getCollections().blogCollection.find().toArray();
    expect(postCollectionArray.length).toBe(0);
    expect(blogCollectionArray.length).toBe(0);
  });
});
