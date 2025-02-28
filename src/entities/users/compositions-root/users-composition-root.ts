import { UsersController } from '../controller/usersController';
import { UsersService } from '../service/usersService';
import { UsersQueryRepository } from '../repository/usersQueryRepository';
import { UsersRepository } from '../repository/usersRepository';
import { db } from '../../../db/composition-root';

const userRepository = new UsersRepository(db);
const usersQueryRepository = new UsersQueryRepository(db);

const usersService = new UsersService(userRepository);

export const userController = new UsersController(usersService, usersQueryRepository);
