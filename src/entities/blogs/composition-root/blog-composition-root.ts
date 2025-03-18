import { BlogsController } from '../controller/blogsController';
import { BlogQueryRepository } from '../infrastructure/blogQueryRepository';
import { PostService } from '../../posts/service/postService';
import { BlogService } from '../service/blogService';
import { PostQueryRepository } from '../../posts/infrastructure/postQueryRepository';
import { PostRepository } from '../../posts/infrastructure/postRepository';
import { BlogRepository } from '../infrastructure/blogRepository';
import { Container } from 'inversify';
import { LikesQueryRepository, LikesRepository } from '../../likes';

const container = new Container();

container.bind(LikesQueryRepository).to(LikesQueryRepository);
container.bind(LikesRepository).to(LikesRepository);
container.bind(PostQueryRepository).to(PostQueryRepository);
container.bind(PostRepository).to(PostRepository);
container.bind(BlogQueryRepository).to(BlogQueryRepository);
container.bind(BlogRepository).to(BlogRepository);
container.bind(PostService).to(PostService);
container.bind(BlogService).to(BlogService);
container.bind(BlogsController).to(BlogsController);

export const blogController = container.get(BlogsController);
