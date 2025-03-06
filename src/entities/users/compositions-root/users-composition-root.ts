import { UsersController } from '../controller/usersController';
import { UsersService } from '../service/usersService';
import { UsersQueryRepository } from '../repository/usersQueryRepository';
import { UsersRepository } from '../repository/usersRepository';
import { db } from '../../../db/composition-root';
import { Container } from 'inversify';
import { DataBase } from '../../../db/mongo-db';

const container = new Container();

container.bind(DataBase).toConstantValue(db);
container.bind(UsersRepository).to(UsersRepository);
container.bind(UsersQueryRepository).to(UsersQueryRepository);
container.bind(UsersService).to(UsersService);
container.bind(UsersController).to(UsersController);

export const userController = container.get(UsersController);
