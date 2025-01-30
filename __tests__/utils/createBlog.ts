import { BlogDto, testingDtosCreator } from './testingDtosCreator';
import request from 'supertest';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';

export const createBlog = async (app: any, blogDto?: BlogDto) => {
  const dto = blogDto ?? testingDtosCreator.createBlogDto({});

  const resp = await request(app)
    .post(PATHS.BLOGS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send(dto)
    .expect(201);
  return resp.body;
};
