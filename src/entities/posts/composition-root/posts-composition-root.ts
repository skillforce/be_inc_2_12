import { PostController } from '../controller/postController';
import { PostService } from '../service/postService';
import { PostQueryRepository } from '../repository/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/repository/blogQueryRepository';
import { PostRepository } from '../repository/postRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../../comments/repository/commentsRepository';
import { CommentsQueryRepository } from '../../comments/repository/commentsQueryRepository';
import { db } from '../../../db/composition-root';

const postRepository = new PostRepository(db);
const postQueryRepository = new PostQueryRepository(db);
const postService = new PostService(postRepository);

const blogQueryRepository = new BlogQueryRepository(db);

const usersRepository = new UsersRepository(db);
const commentsRepository = new CommentsRepository(db);
const commentsQueryRepository = new CommentsQueryRepository(db);

const commentsService = new CommentsService(usersRepository, commentsRepository);

export const postController = new PostController(
  postService,
  postQueryRepository,
  blogQueryRepository,
  commentsService,
  commentsQueryRepository,
);
