import { UsersController } from '../controller/usersController';
import { UsersService } from '../service/usersService';
import { UsersQueryRepository } from '../repository/usersQueryRepository';
import { UsersRepository } from '../repository/usersRepository';

const userRepository = new UsersRepository();
const usersService = new UsersService(userRepository);
const usersQueryRepository = new UsersQueryRepository();

export const userController = new UsersController(usersService, usersQueryRepository);
