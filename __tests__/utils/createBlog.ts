import { BlogDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { BlogViewModel } from '../../src/entities/blogs/types/types';
import { HttpStatuses } from '../../src/common/types/httpStatuses';

type CreateBlogParams = {
  blogDto?: BlogDto;
  expectedHttpStatus?: HttpStatuses;
};

export const createBlog = async ({
  blogDto,
  expectedHttpStatus = HttpStatuses.Created,
}: CreateBlogParams): Promise<BlogViewModel> => {
  const dto = blogDto ?? testingDtosCreator.createBlogDto({});

  const resp = await req
    .post(PATHS.BLOGS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send(dto)
    .expect(expectedHttpStatus);

  return resp.body;
};
