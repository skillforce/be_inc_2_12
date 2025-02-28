import { AuthRepository } from '../repository/authRepository';
import { UsersQueryRepository } from '../../../entities/users/repository/usersQueryRepository';
import { AuthService } from '../service/authService';
import { AuthController } from '../controller/authController';
import { db } from '../../../db/composition-root';

const authRepository = new AuthRepository(db);

const usersQueryRepository = new UsersQueryRepository(db);

const authService = new AuthService(authRepository);

export const authController = new AuthController(usersQueryRepository, authService);
