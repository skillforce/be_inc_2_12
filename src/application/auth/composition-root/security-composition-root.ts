import { AuthQueryRepository } from '../repository/authQueryRepository';
import { AuthRepository } from '../repository/authRepository';
import { SecurityService } from '../service/securityService';
import { SecurityController } from '../controller/securityController';
import { Container } from 'inversify';

const container = new Container();

container.bind(AuthQueryRepository).to(AuthQueryRepository);
container.bind(AuthRepository).to(AuthRepository);
container.bind(SecurityService).to(SecurityService);
container.bind(SecurityController).to(SecurityController);

export const securityController = container.get(SecurityController);
