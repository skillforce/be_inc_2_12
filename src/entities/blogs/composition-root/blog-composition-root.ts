import { BlogsController } from '../controller/blogsController';
import { BlogQueryRepository } from '../repository/blogQueryRepository';
import { PostService } from '../../posts/service/postService';
import { BlogService } from '../service/blogService';
import { PostQueryRepository } from '../../posts/repository/postQueryRepository';
import { PostRepository } from '../../posts/repository/postRepository';
import { BlogRepository } from '../repository/blogRepository';
import { db } from '../../../db/composition-root';

const postQueryRepository = new PostQueryRepository(db);
const postRepository = new PostRepository(db);

const blogQueryRepository = new BlogQueryRepository(db);
const blogRepository = new BlogRepository(db);

const postService = new PostService(postRepository);
const blogService = new BlogService(blogRepository);

export const blogController = new BlogsController(
  postService,
  blogService,
  postQueryRepository,
  blogQueryRepository,
);
