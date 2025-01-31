import { PostDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { RequireOnlyOne } from '../../src/common/types/types';
import { PostOutputDBType } from '../../src/entities/posts/types/types';

export const createPost = async (
  postDto: RequireOnlyOne<PostDto, 'blogId'>,
): Promise<PostOutputDBType> => {
  const newPostDto = testingDtosCreator.createPostDto(postDto);

  const newPost = await req
    .post(PATHS.POSTS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send(newPostDto)
    .expect(201);

  return newPost.body;
};
