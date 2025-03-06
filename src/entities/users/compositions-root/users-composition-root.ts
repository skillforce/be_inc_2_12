import { UsersController } from '../controller/usersController';
import { UsersService } from '../service/usersService';
import { UsersQueryRepository } from '../repository/usersQueryRepository';
import { UsersRepository } from '../repository/usersRepository';
import { Container } from 'inversify';

const container = new Container();

container.bind(UsersRepository).to(UsersRepository);
container.bind(UsersQueryRepository).to(UsersQueryRepository);
container.bind(UsersService).to(UsersService);
container.bind(UsersController).to(UsersController);

export const userController = container.get(UsersController);
