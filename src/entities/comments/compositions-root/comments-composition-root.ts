import { CommentsController } from '../controller/commentsController';
import { CommentsQueryRepository } from '../infrastructure/commentsQueryRepository';
import { CommentsService } from '../service/commentsService';
import { UsersRepository } from '../../users/infrastructure/usersRepository';
import { CommentsRepository } from '../infrastructure/commentsRepository';
import { Container } from 'inversify';
import { LikesQueryRepository, LikesRepository } from '../../likes';

const container = new Container({ defaultScope: 'Singleton' });

container.bind(LikesRepository).to(LikesRepository);
container.bind(LikesQueryRepository).to(LikesQueryRepository);
container.bind(UsersRepository).to(UsersRepository);
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(CommentsService).to(CommentsService);
container.bind(CommentsController).to(CommentsController);

export const commentsController = container.get(CommentsController);
