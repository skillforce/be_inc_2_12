import { AuthQueryRepository } from '../repository/authQueryRepository';
import { AuthRepository } from '../repository/authRepository';
import { SecurityService } from '../service/securityService';
import { SecurityController } from '../controller/securityController';
import { db } from '../../../db/composition-root';

const authQueryRepository = new AuthQueryRepository(db);

const authRepository = new AuthRepository(db);
const securityService = new SecurityService(authRepository);

export const securityController = new SecurityController(authQueryRepository, securityService);
