import { BlogDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { BlogDBOutputType } from '../../src/entities/blogs/types/types';

export const createBlog = async (blogDto?: BlogDto): Promise<BlogDBOutputType> => {
  const dto = blogDto ?? testingDtosCreator.createBlogDto({});

  const resp = await req
    .post(PATHS.BLOGS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send(dto)
    .expect(201);

  return resp.body;
};
