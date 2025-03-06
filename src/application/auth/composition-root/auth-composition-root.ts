import { AuthRepository } from '../repository/authRepository';
import { UsersQueryRepository } from '../../../entities/users/repository/usersQueryRepository';
import { AuthService } from '../service/authService';
import { AuthController } from '../controller/authController';
import { db } from '../../../db/composition-root';
import { Container } from 'inversify';
import { DataBase } from '../../../db/mongo-db';

const container = new Container();

container.bind(DataBase).toConstantValue(db);
container.bind(AuthRepository).to(AuthRepository);
container.bind(UsersQueryRepository).to(UsersQueryRepository);
container.bind(AuthService).to(AuthService);
container.bind(AuthController).to(AuthController);

export const authController: AuthController = container.get(AuthController);
