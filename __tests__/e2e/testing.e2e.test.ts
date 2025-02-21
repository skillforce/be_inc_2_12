import { req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../../src/db/mongo-db';
import { PATHS } from '../../src/common/paths/paths';

describe('/testing', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.run(uri);
  }, 10000);
  it('should return 204 status ', async () => {
    await req.delete(PATHS.TESTING + '/all-data').expect(204);
    const postCollectionArray = await db.getCollections().postCollection.find().toArray();
    const blogCollectionArray = await db.getCollections().blogCollection.find().toArray();
    const usersCollection = await db.getCollections().usersCollection.find().toArray();
    const commentsCollection = await db.getCollections().commentsCollection.find().toArray();
    const authMetaCollection = await db.getCollections().authMetaCollection.find().toArray();
    const triggerAttemptsCollection = await db
      .getCollections()
      .triggerAttemptsCollection.find()
      .toArray();
    expect(postCollectionArray.length).toBe(0);
    expect(blogCollectionArray.length).toBe(0);
    expect(usersCollection.length).toBe(0);
    expect(commentsCollection.length).toBe(0);
    expect(authMetaCollection.length).toBe(0);
    expect(triggerAttemptsCollection.length).toBe(0);
  });
});
