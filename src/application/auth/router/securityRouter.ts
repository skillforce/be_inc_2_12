import { Router } from 'express';
import {
  getDevicesByUserIdRequestValidators,
  removeSessionsByDeviceIdRequestValidators,
  removeSessionsRequestValidators,
} from '../middlewares/authInputValidationMiddleware';
import { securityController } from '../composition-root/security-composition-root';

export const securityRouter = Router({});

securityRouter.get(
  '/devices',
  getDevicesByUserIdRequestValidators,
  securityController.getDevices.bind(securityController),
);

securityRouter.delete(
  '/devices',
  removeSessionsRequestValidators,
  securityController.deleteDevices.bind(securityController),
);

securityRouter.delete(
  '/devices/:id',
  removeSessionsByDeviceIdRequestValidators,
  securityController.deleteDeviceById.bind(securityController),
);
