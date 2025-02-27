import { AuthController } from './controller/authController';
import { UsersQueryRepository } from '../../entities/users/repository/usersQueryRepository';
import { AuthService } from './service/authService';
import { AuthRepository } from './repository/authRepository';

const authRepository = new AuthRepository();

const usersQueryRepository = new UsersQueryRepository();

const authService = new AuthService(authRepository);

export const authController = new AuthController(usersQueryRepository, authService);
