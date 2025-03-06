import { AuthRepository } from '../repository/authRepository';
import { UsersQueryRepository } from '../../../entities/users/repository/usersQueryRepository';
import { AuthService } from '../service/authService';
import { AuthController } from '../controller/authController';
import { Container } from 'inversify';
import { UsersRepository } from '../../../entities/users/repository/usersRepository';

const container = new Container();

container.bind(UsersRepository).to(UsersRepository);
container.bind(AuthRepository).to(AuthRepository);
container.bind(UsersQueryRepository).to(UsersQueryRepository);
container.bind(AuthService).to(AuthService);
container.bind(AuthController).to(AuthController);

export const authController: AuthController = container.get(AuthController);
