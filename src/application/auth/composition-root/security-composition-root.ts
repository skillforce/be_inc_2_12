import { SecurityController } from './controller/securityController';
import { SecurityService } from './service/securityService';
import { AuthRepository } from './repository/authRepository';
import { AuthQueryRepository } from './repository/authQueryRepository';

const authQueryRepository = new AuthQueryRepository();

const authRepository = new AuthRepository();
const securityService = new SecurityService(authRepository);

export const securityController = new SecurityController(authQueryRepository, securityService);
