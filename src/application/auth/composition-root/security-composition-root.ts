import { AuthQueryRepository } from '../repository/authQueryRepository';
import { AuthRepository } from '../repository/authRepository';
import { SecurityService } from '../service/securityService';
import { SecurityController } from '../controller/securityController';
import { db } from '../../../db/composition-root';
import { Container } from 'inversify';
import { DataBase } from '../../../db/mongo-db';

const container = new Container();

container.bind(DataBase).toConstantValue(db);
container.bind(AuthQueryRepository).to(AuthQueryRepository);
container.bind(AuthRepository).to(AuthRepository);
container.bind(SecurityService).to(SecurityService);
container.bind(SecurityController).to(SecurityController);

export const securityController = container.get(SecurityController);
