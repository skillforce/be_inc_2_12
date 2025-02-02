import { CommentDto, testingDtosCreator } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { CommentViewModel } from '../../src/entities/comments/types/types';

type CreateComment = {
  postId: string;
  accessToken: string;
  newCommentDto?: CommentDto;
  expectedHttpStatus?: HttpStatuses;
};

export const createComment = async ({
  postId,
  accessToken,
  newCommentDto,
  expectedHttpStatus = HttpStatuses.Created,
}: CreateComment): Promise<CommentViewModel> => {
  const newComment = testingDtosCreator.createCommentDto(newCommentDto);

  const newPost = await req
    .post(`${PATHS.POSTS}/${postId}/comments`)
    .auth(accessToken, { type: 'bearer' })
    .send(newComment)
    .expect(expectedHttpStatus);

  return newPost.body;
};
