import { PostController } from '../controller/postController';
import { PostService } from '../service/postService';
import { PostQueryRepository } from '../repository/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/repository/blogQueryRepository';
import { PostRepository } from '../repository/postRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../../comments/repository/commentsRepository';
import { CommentsQueryRepository } from '../../comments/repository/commentsQueryRepository';
import { Container } from 'inversify';

const container = new Container();

container.bind(PostRepository).to(PostRepository);
container.bind(PostQueryRepository).to(PostQueryRepository);
container.bind(PostService).to(PostService);
container.bind(BlogQueryRepository).to(BlogQueryRepository);
container.bind(UsersRepository).to(UsersRepository);
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(CommentsService).to(CommentsService);
container.bind(PostController).to(PostController);

export const postController = container.get(PostController);
