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

export const likeComment = async ({
  commentId,
  accessToken,
  isDislike = false,
  expectedHttpStatus = HttpStatuses.NoContent,
}: {
  commentId: string;
  accessToken: string;
  isDislike?: boolean;
  expectedHttpStatus?: HttpStatuses;
}) => {
  await req
    .put(`${PATHS.COMMENTS}/${commentId}/like-status`)
    .send({ likeStatus: isDislike ? 'Dislike' : 'Like' })
    .auth(accessToken, { type: 'bearer' })
    .expect(expectedHttpStatus);
};

export const getComment = async ({
  commentId,
  accessToken,
}: {
  commentId: string;
  accessToken: string;
}) => {
  const comment = await req
    .get(`${PATHS.COMMENTS}/${commentId}`)
    .auth(accessToken, { type: 'bearer' })
    .expect(HttpStatuses.Success);
  return comment.body;
};
