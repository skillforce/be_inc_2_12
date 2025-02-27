import { CommentsController } from '../controller/commentsController';
import { CommentsQueryRepository } from '../repository/commentsQueryRepository';
import { CommentsService } from '../service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../repository/commentsRepository';

const usersRepository = new UsersRepository();

const commentsRepository = new CommentsRepository();
const commentsQueryRepository = new CommentsQueryRepository();

const commentsService = new CommentsService(usersRepository, commentsRepository);

export const commentsController = new CommentsController(commentsQueryRepository, commentsService);
