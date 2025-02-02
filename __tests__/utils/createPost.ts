import { BlogDto, PostDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { RequireOnlyOne } from '../../src/common/types/types';
import { PostViewModel } from '../../src/entities/posts/types/types';
import { HttpStatuses } from '../../src/common/types/httpStatuses';

type CreatePostParams = {
  postDto: RequireOnlyOne<PostDto, 'blogId'>;
  expectedHttpStatus?: HttpStatuses;
};

export const createPost = async ({
  postDto,
  expectedHttpStatus = HttpStatuses.Created,
}: CreatePostParams): Promise<PostViewModel> => {
  const newPostDto = testingDtosCreator.createPostDto(postDto);

  const newPost = await req
    .post(PATHS.POSTS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send(newPostDto)
    .expect(expectedHttpStatus);

  return newPost.body;
};
