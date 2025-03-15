import { CommentsController } from '../controller/commentsController';
import { CommentsQueryRepository } from '../repository/commentsQueryRepository';
import { CommentsService } from '../service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../repository/commentsRepository';
import { Container } from 'inversify';
import { CommentsLikesQueryRepository, CommentsLikesRepository } from '../../likes';

const container = new Container({ defaultScope: 'Singleton' });

container.bind(CommentsLikesRepository).to(CommentsLikesRepository);
container.bind(CommentsLikesQueryRepository).to(CommentsLikesQueryRepository);
container.bind(UsersRepository).to(UsersRepository);
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(CommentsService).to(CommentsService);
container.bind(CommentsController).to(CommentsController);

export const commentsController = container.get(CommentsController);
