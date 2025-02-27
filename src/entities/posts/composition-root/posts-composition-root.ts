import { PostController } from '../controller/postController';
import { PostService } from '../service/postService';
import { PostQueryRepository } from '../repository/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/repository/blogQueryRepository';
import { PostRepository } from '../repository/postRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../../comments/repository/commentsRepository';
import { CommentsQueryRepository } from '../../comments/repository/commentsQueryRepository';

const postRepository = new PostRepository();
const postQueryRepository = new PostQueryRepository();
const postService = new PostService(postRepository);

const blogQueryRepository = new BlogQueryRepository();

const usersRepository = new UsersRepository();
const commentsRepository = new CommentsRepository();
const commentsQueryRepository = new CommentsQueryRepository();

const commentsService = new CommentsService(usersRepository, commentsRepository);

export const postController = new PostController(
  postService,
  postQueryRepository,
  blogQueryRepository,
  commentsService,
  commentsQueryRepository,
);
