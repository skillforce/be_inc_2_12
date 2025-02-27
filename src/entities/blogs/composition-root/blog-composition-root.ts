import { BlogsController } from '../controller/blogsController';
import { BlogQueryRepository } from '../repository/blogQueryRepository';
import { PostService } from '../../posts/service/postService';
import { BlogService } from '../service/blogService';
import { PostQueryRepository } from '../../posts/repository/postQueryRepository';
import { PostRepository } from '../../posts/repository/postRepository';
import { BlogRepository } from '../repository/blogRepository';

const postQueryRepository = new PostQueryRepository();
const postRepository = new PostRepository();

const blogQueryRepository = new BlogQueryRepository();
const blogRepository = new BlogRepository();

const postService = new PostService(postRepository);
const blogService = new BlogService(blogRepository);

export const blogController = new BlogsController(
  postService,
  blogService,
  postQueryRepository,
  blogQueryRepository,
);
