import { PostController } from '../controller/postController';
import { PostService } from '../service/postService';
import { PostQueryRepository } from '../infrastructure/postQueryRepository';
import { BlogQueryRepository } from '../../blogs/infrastructure/blogQueryRepository';
import { PostRepository } from '../infrastructure/postRepository';
import { CommentsService } from '../../comments/service/commentsService';
import { UsersRepository } from '../../users/infrastructure/usersRepository';
import { CommentsRepository } from '../../comments/infrastructure/commentsRepository';
import { CommentsQueryRepository } from '../../comments/infrastructure/commentsQueryRepository';
import { Container } from 'inversify';
import { CommentsLikesQueryRepository, CommentsLikesRepository } from '../../likes';

const container = new Container();

container.bind(CommentsLikesQueryRepository).to(CommentsLikesQueryRepository);
container.bind(CommentsLikesRepository).to(CommentsLikesRepository);
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
