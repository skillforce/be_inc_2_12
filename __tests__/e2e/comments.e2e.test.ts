import { cleanDB, req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserViewModel } from '../../src/entities/users/types/types';
import { PATHS } from '../../src/common/paths/paths';
import { createBlog } from '../utils/createBlog';
import { createPost } from '../utils/createPost';
import { createUser } from '../utils/userHelpers';
import { createComment } from '../utils/createComment';
import { loginUser } from '../utils/login';
import { CommentViewModel } from '../../src/entities/comments/types/types';
import { PostViewModel } from '../../src/entities/posts/types/types';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { db } from '../../src/db/composition-root';

const firstUser = {
  email: 'testo@gmail.com',
  login: 'test123',
  password: 'Password1!',
};
const secondUser = {
  email: 'testo1@gmail.com',
  login: 'test1232',
  password: 'Password1!',
};

let createdFirstUser = {} as UserViewModel;
let createdFirstUserAccessToken = '';

let createdSecondUser = {} as UserViewModel;
let createdSecondUserAccessToken = '';

let createdPost = {} as PostViewModel;
let createdComment = {} as CommentViewModel;

describe('/comments', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();

    await db.run(uri);
    await cleanDB();

    createdFirstUser = await createUser({
      userDto: {
        email: firstUser.email,
        login: firstUser.login,
        pass: firstUser.password,
      },
    });
    createdSecondUser = await createUser({
      userDto: {
        email: secondUser.email,
        login: secondUser.login,
        pass: secondUser.password,
      },
    });

    const authFirstUser = await loginUser({
      loginData: {
        loginOrEmail: firstUser.login,
        password: firstUser.password,
      },
    });
    createdFirstUserAccessToken = authFirstUser.accessToken;

    const authSecondUser = await loginUser({
      loginData: {
        loginOrEmail: secondUser.login,
        password: secondUser.password,
      },
    });
    createdSecondUserAccessToken = authSecondUser.accessToken;
  }, 10000);

  it('should create comment for appropriate post for user which is logged in', async () => {
    const newBlog = await createBlog({});
    createdPost = await createPost({ postDto: { blogId: newBlog.id } });
    createdComment = await createComment({
      postId: createdPost.id,
      accessToken: createdFirstUserAccessToken,
    });
    console.log(createdFirstUser);

    expect(createdComment.commentatorInfo.userId).toBe(createdFirstUser.id);
  });

  it("should return comment by it's id", async () => {
    await req.get(`${PATHS.COMMENTS}/${createdComment.id}`).expect(200);
  });
  it('should return paginated data with comments by appropriate post id', async () => {
    const res = await req.get(`${PATHS.POSTS}/${createdPost.id}/comments`).expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return 403(FORBIDDEN) error when user try to update comment which is not his own', async () => {
    const newCommentContent = 'new content for checking update';
    await req
      .put(`${PATHS.COMMENTS}/${createdComment.id}`)
      .send({
        content: newCommentContent,
      })
      .auth(createdSecondUserAccessToken, { type: 'bearer' })
      .expect(403);

    const updatedComment = await req
      .get(`${PATHS.COMMENTS}/${createdComment.id}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .expect(200);

    expect(updatedComment.body.content).toBe(createdComment.content);
  });
  it('should update comment', async () => {
    const newCommentContent = 'new content for checking update';
    await req
      .put(`${PATHS.COMMENTS}/${createdComment.id}`)
      .send({
        content: newCommentContent,
      })
      .auth(createdFirstUserAccessToken, { type: 'bearer' })
      .expect(204);

    const updatedComment = await req.get(`${PATHS.COMMENTS}/${createdComment.id}`).expect(200);

    expect(updatedComment.body.content).toBe(newCommentContent);
  });
  it('should return 403(FORBIDDEN) error when user try to delete comment which is not his own', async () => {
    await req
      .delete(`${PATHS.COMMENTS}/${createdComment.id}`)
      .auth(createdSecondUserAccessToken, { type: 'bearer' })
      .expect(403);

    const comments = await req.get(`${PATHS.POSTS}/${createdPost.id}/comments`).expect(200);

    expect(comments.body.items.length).toBe(1);
  });

  it('should delete comment', async () => {
    await req
      .delete(`${PATHS.COMMENTS}/${createdComment.id}`)
      .auth(createdFirstUserAccessToken, { type: 'bearer' })
      .expect(204);

    const comments = await req.get(`${PATHS.POSTS}/${createdPost.id}/comments`).expect(200);

    expect(comments.body.items.length).toBe(0);
  });
});
