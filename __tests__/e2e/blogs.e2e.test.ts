import { cleanDB, req } from '../utils/test-helpers';
import { AddUpdateBlogRequiredInputData, BlogDbModel } from '../../src/entities/blogs/types/types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PATHS } from '../../src/common/paths/paths';
import { BlogService } from '../../src/entities/blogs/service/blogService';
import { BlogRepository } from '../../src/entities/blogs/infrastructure/blogRepository';
import { BlogModel } from '../../src/entities/blogs';
import { db } from '../../src/db/composition-root';

const blogRepository = new BlogRepository();
const blogService = new BlogService(blogRepository);

describe('/blogs', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();
    await db.connect(uri);
    await cleanDB();
  }, 10000);

  it('should get empty array', async () => {
    const res = await req.get(PATHS.BLOGS).expect(200);

    expect(res.body.items.length).toBe(0);
  });
  it('should get not empty array', async () => {
    const insertData = {
      name: 'Video Name',
      websiteUrl: 'https://www.youtube.com',
      description: 'Video Description',
    };

    await blogService.addBlog(insertData as BlogDbModel);

    const res = await req.get(PATHS.BLOGS).expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return error when try to get item with id that doesnt exist ', async () => {
    await req.get(PATHS.BLOGS + '/3').expect(404);
  });
  it('should create blog object and return created one back to the client', async () => {
    const blogData: AddUpdateBlogRequiredInputData = {
      name: 'Blog Name',
      websiteUrl: 'https://www.youtube.com',
      description: 'Blog Description',
    };
    const res = await req
      .post(PATHS.BLOGS)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(blogData);
    expect(res.body).toMatchObject(blogData);
  });
  it('should create new post and apply blog id that has been sent', async () => {
    const blogFromDb = await BlogModel.find().lean();
    const blogId = blogFromDb[0]._id;

    const postData = {
      title: 'Video Name123',
      shortDescription: 'Video Description',
      content: 'Video Content',
    };

    const res = await req
      .post(PATHS.BLOGS + '/' + blogId + '/posts')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(postData);
    expect(res.body).toMatchObject(postData);
  });
  it('should return post items with appropriate blog id', async () => {
    const blogFromDb = await BlogModel.find().lean();
    const blogId = blogFromDb[0]._id;

    const postData = {
      title: 'Video Name123',
      shortDescription: 'Video Description',
      content: 'Video Content',
    };

    const res = await req.get(PATHS.BLOGS + '/' + blogId + '/posts');

    expect(res.body.items[0]).toMatchObject(postData);
  });
  it('should update blog object and return 204 status to client', async () => {
    const blogCollectionArray = (await BlogModel.find().lean()) as BlogDbModel[];
    const idToUpdate = blogCollectionArray[0]._id;
    const blogData = {
      name: 'Video Name123',
      websiteUrl: 'https://www.youtube.com',
      description: 'Video Description',
    };
    await req
      .put(`${PATHS.BLOGS}/${idToUpdate}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(blogData)
      .expect(204);
  });
  it('should return 400 when body properties is incorrect', async () => {
    const blogCollectionArray = (await BlogModel.find().lean()) as BlogDbModel[];
    const idToUpdate = blogCollectionArray[0]._id;
    const blogData = {
      name: '',
      websiteUrl: true,
      description: 123,
    };
    await req
      .put(`${PATHS.BLOGS}/${idToUpdate}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(blogData)
      .expect(400);
  });
  it('should remove video by id', async () => {
    const blogCollectionArray = (await BlogModel.find().lean()) as BlogDbModel[];
    const idToUpdate = blogCollectionArray[0]._id;
    await req
      .delete(`${PATHS.BLOGS}/${idToUpdate}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(204);
  });
  it('should return 404 status ', async () => {
    await req
      .delete(PATHS.BLOGS + '/1')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(404);
  });
});
