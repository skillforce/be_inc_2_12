import { cleanDB, req } from '../utils/test-helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PATHS } from '../../src/common/paths/paths';
import { createBlog } from '../utils/createBlog';
import { createPost } from '../utils/createPost';
import { PostDto, UserDto } from '../utils/testingDtosCreator';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { db } from '../../src/db/composition-root';
import { createAndLoginUser, createUser } from '../utils/userHelpers';
import { LikeModel } from '../../src/entities/likes/domain/Like.entity';

describe('/posts', () => {
  beforeAll(async () => {
    const dbServer = await MongoMemoryServer.create();
    const uri = dbServer.getUri();

    await db.connect(uri);
    await cleanDB();
  }, 10000);

  it('should get empty array', async () => {
    const res = await req.get(PATHS.POSTS).expect(200);

    expect(res.body.items.length).toBe(0);
  });
  it('should get not empty array', async () => {
    const newBlog = await createBlog({});
    const blogId = newBlog.id;

    await createPost({ postDto: { blogId } });

    const res = await req.get(PATHS.POSTS).expect(200);

    expect(res.body.items.length).toBe(1);
  });
  it('should return error when try to get item with id that doesnt exist ', async () => {
    await req.get(PATHS.POSTS + '/3').expect(404);
  });
  it('should create post object and return created one back to client', async () => {
    const newBlog = await createBlog({});
    const blogId = newBlog.id;

    const postDto: PostDto = {
      title: 'Post Name',
      shortDescription: 'Post Description',
      content: 'Post Content',
      blogId: blogId,
    };

    const newPost = await createPost({ postDto });

    expect(newPost).toMatchObject(postDto);
  });
  it('should return 400 when try to create post with non-existing blogID', async () => {
    const postData: PostDto = {
      title: 'Post Name',
      shortDescription: 'Post Description',
      content: 'Post Content',
      blogId: '1',
    };
    await req.post(PATHS.POSTS).set('Authorization', ADMIN_AUTH_HEADER).send(postData).expect(400);
  });
  it('should update post object and return 204 status to client', async () => {
    const newBlog = await createBlog({});
    const blogId = newBlog.id;

    const postDto: PostDto = {
      title: 'Post Name123sss',
      shortDescription: 'Post Description',
      content: 'Post Content',
      blogId: blogId,
    };
    const newPost = await createPost({ postDto });
    const newPostId = newPost.id;

    const updatedPostTitle = 'Updated Post Title';

    await req
      .put(`${PATHS.POSTS}/${newPostId}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send({ ...postDto, title: updatedPostTitle })
      .expect(204);

    const res = await req
      .get(`${PATHS.POSTS}/${newPostId}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .expect(200);

    expect(res.body.title).toBe(updatedPostTitle);
  });
  it('should return error when try to update post with non-existing blogID', async () => {
    const posts = await req.get(PATHS.POSTS).expect(200);
    const postToUpdate = posts.body.items[0];

    const postData = {
      ...postToUpdate,
      blogId: '2',
    };

    await req
      .put(`${PATHS.POSTS}/${postToUpdate.id}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send(postData)
      .expect(400);
  });
  it('should return 400 when body properties is incorrect', async () => {
    const posts = await req.get(PATHS.POSTS).expect(200);
    const postToUpdate = posts.body.items[0];
    const postData = {
      title: 123,
      shortDescription: true,
      content: [],
      blogId: true,
    };
    await req
      .put(`${PATHS.POSTS}/${postToUpdate.id}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .send(postData)
      .expect(400);
  });
  it('should remove post by id', async () => {
    const posts = await req.get(PATHS.POSTS).expect(200);
    const postToUpdate = posts.body.items[0];

    const res = await req
      .delete(`${PATHS.POSTS}/${postToUpdate.id}`)
      .set('Authorization', ADMIN_AUTH_HEADER)
      .expect(204);
  });
  it('should return 404 status ', async () => {
    await req
      .delete(PATHS.POSTS + '/1')
      .set('Authorization', ADMIN_AUTH_HEADER)
      .expect(404);
  });
  it('should return posts with correct extended like statuses ', async () => {
    const firstUser = await createAndLoginUser();
    const secondUser = await createAndLoginUser();
    const thirdUser = await createAndLoginUser();
    const fourthUser = await createAndLoginUser();
    const posts = await req.get(PATHS.POSTS).expect(200);
    const firstPost = posts.body.items[0];
    const firstPostId = firstPost.id;

    await req
      .put(PATHS.POSTS + '/' + firstPostId + '/like-status')
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
    await req
      .put(PATHS.POSTS + '/' + firstPostId + '/like-status')
      .auth(secondUser.body.accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
    await req
      .put(PATHS.POSTS + '/' + firstPostId + '/like-status')
      .auth(thirdUser.body.accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
    await req
      .put(PATHS.POSTS + '/' + firstPostId + '/like-status')
      .auth(fourthUser.body.accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'Dislike',
      })
      .expect(204);
    const postsAfterLikes = await req
      .get(PATHS.POSTS)
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .expect(200);

    expect(postsAfterLikes.body.items[0].extendedLikesInfo.myStatus).toBe('Like');
    expect(postsAfterLikes.body.items[0].extendedLikesInfo.likesCount).toBe(3);
    expect(postsAfterLikes.body.items[0].extendedLikesInfo.dislikesCount).toBe(1);
  });
  it('should return error if like status request body is incorrect ', async () => {
    const firstUser = await createAndLoginUser();
    const posts = await req.get(PATHS.POSTS).expect(200);
    const firstPost = posts.body.items[0];
    const firstPostId = firstPost.id;

    await req
      .put(PATHS.POSTS + '/' + firstPostId + '/like-status')
      .auth(firstUser.body.accessToken, { type: 'bearer' })
      .send({
        likeStatus: 'sssssss',
      })
      .expect(400);
  });
});
