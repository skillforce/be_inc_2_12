import { CommentsController } from '../controller/commentsController';
import { CommentsQueryRepository } from '../repository/commentsQueryRepository';
import { CommentsService } from '../service/commentsService';
import { UsersRepository } from '../../users/repository/usersRepository';
import { CommentsRepository } from '../repository/commentsRepository';
import { db } from '../../../db/composition-root';

const usersRepository = new UsersRepository(db);

const commentsRepository = new CommentsRepository(db);
const commentsQueryRepository = new CommentsQueryRepository(db);

const commentsService = new CommentsService(usersRepository, commentsRepository);

export const commentsController = new CommentsController(commentsQueryRepository, commentsService);
