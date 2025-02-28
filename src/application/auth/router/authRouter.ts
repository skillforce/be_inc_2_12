import { Router } from 'express';
import {
  confirmRegistrationBodyValidators,
  loginBodyValidators,
  logoutRequestValidators,
  meRequestValidators,
  refreshTokenGuard,
  registrationBodyValidators,
  resendRegistrationEmailBodyValidators,
} from '../middlewares/authInputValidationMiddleware';
import { authController } from '../composition-root/auth-composition-root';

export const authRouter = Router({});

authRouter.post('/login', loginBodyValidators, authController.loginUser.bind(authController));

authRouter.post(
  '/refresh-token',
  refreshTokenGuard,
  authController.refreshToken.bind(authController),
);

authRouter.post('/logout', logoutRequestValidators, authController.logout.bind(authController));

authRouter.post(
  '/registration',
  registrationBodyValidators,
  authController.registerUser.bind(authController),
);

authRouter.post(
  '/registration-confirmation',
  confirmRegistrationBodyValidators,
  authController.confirmRegistrationCode.bind(authController),
);

authRouter.post(
  '/registration-email-resending',
  resendRegistrationEmailBodyValidators,
  authController.resendRegistrationEmail.bind(authController),
);

authRouter.get('/me', meRequestValidators, authController.getMe.bind(authController));
