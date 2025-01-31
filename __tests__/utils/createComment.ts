import { CommentDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { CommentDBOutputType } from '../../src/entities/comments/types/types';

export const createComment = async (
  postId: string,
  accessToken: string,
  newCommentDto?: CommentDto,
): Promise<CommentDBOutputType> => {
  const newComment = testingDtosCreator.createCommentDto(newCommentDto);

  const newPost = await req
    .post(`${PATHS.POSTS}/${postId}/comments`)
    .auth(accessToken, { type: 'bearer' })
    .send(newComment)
    .expect(HttpStatuses.Created);

  return newPost.body;
};
