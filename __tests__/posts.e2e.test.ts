import { req } from './test-helpers';
import { BlogDBType } from '../src/entities/blogs/types/types';
import { AddUpdatePostRequestRequiredData, PostDBType } from '../src/entities/posts/types/types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { db } from '../src/db/mongo-db';
import { PATHS } from '../src/common/paths/paths';

describe('/posts', () => {
  beforeAll(async () => {
    // очистка базы данных перед началом тестирования
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();

    await db.run(uri);
    await db.drop();
  }, 10000);

  it('should get empty array', async () => {
    await db.getCollections().postCollection.deleteMany({});
    const res = await req.get(PATHS.POSTS).expect(200);

    expect(res.body.items.length).toBe(0);
  });
  it('should get not empty array', async () => {
    const result = await db.getCollections().blogCollection.insertOne({
      name: 'Video Name',
      websiteUrl: 'https://www.youtube.com',
      description: 'Video Description',
    } as BlogDBType);
    const blogId = result.insertedId;

    const insertData = {
      title: 'Video Name',
      shortDescription: 'Video Description',
      content: 'Video Content',
      blogId: blogId,
    };

    await db.getCollections().postCollection.insertOne(insertData as unknown as PostDBType);

    const res = await req.get(PATHS.POSTS).expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return error when try to get item with id that doesnt exist ', async () => {
    const res = await req.get(PATHS.POSTS + '/3').expect(404);
  });
  it('should create post object and return created one back to client', async () => {
    const result = await db.getCollections().blogCollection.insertOne({
      name: 'Video Name',
      websiteUrl: 'https://www.youtube.com',
      description: 'Video Description',
    } as BlogDBType);
    const blogId = result.insertedId;

    const postData: AddUpdatePostRequestRequiredData = {
      title: 'Video Name',
      shortDescription: 'Video Description',
      content: 'Video Content',
      blogId: blogId.toString(),
    };
    const res = await req
      .post(PATHS.POSTS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData);

    expect(res.body).toMatchObject(postData);
  });
  it('should return 400 when try to create post with non-existing blogID', async () => {
    const postData: AddUpdatePostRequestRequiredData = {
      title: 'Video Name',
      shortDescription: 'Video Description',
      content: 'Video Content',
      blogId: '1',
    };
    const res = await req
      .post(PATHS.POSTS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData)
      .expect(400);
  });
  it('should update post object and return 204 status to client', async () => {
    const result = await db.getCollections().blogCollection.insertOne({
      name: 'Video Name',
      websiteUrl: 'https://www.youtube.com',
      description: 'Video Description',
    } as BlogDBType);
    const blogId = result.insertedId;

    const postsListCollection = await db.getCollections().postCollection.find().toArray();

    const postIdToUpdate = postsListCollection[0]._id;

    const postData = {
      title: 'Video Name123sss',
      shortDescription: 'Video Description',
      content: 'Video Content',
      blogId: blogId.toString(),
    };
    await req
      .put(`${PATHS.POSTS}/${postIdToUpdate.toString()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData)
      .expect(204);
  });
  it('should return error when try to update post with non-existing blogID', async () => {
    const postsListCollection = await db.getCollections().postCollection.find().toArray();

    const postIdToUpdate = postsListCollection[0]._id;

    const postData = {
      title: 'Video Name123',
      shortDescription: 'Video Description',
      content: 'Video Content',
      blogId: '2',
    };
    const res = await req
      .put(`${PATHS.POSTS}/${postIdToUpdate.toString()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData)
      .expect(400);
  });
  it('should return 400 when body properties is incorrect', async () => {
    const postsListCollection = await db.getCollections().postCollection.find().toArray();

    const postIdToUpdate = postsListCollection[0]._id;
    const postData = {
      title: 123,
      shortDescription: true,
      content: [],
      blogId: true,
    };
    const res = await req
      .put(`${PATHS.POSTS}/${postIdToUpdate.toString()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData)
      .expect(400);
  });
  it('should remove post by id', async () => {
    const postsListCollection = await db.getCollections().postCollection.find().toArray();

    const postIdToDelete = postsListCollection[0]._id;

    const res = await req
      .delete(`${PATHS.POSTS}/${postIdToDelete.toString()}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(204);
  });
  it('should return 404 status ', async () => {
    await req
      .delete(PATHS.POSTS + '/1')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(404);
  });
});
