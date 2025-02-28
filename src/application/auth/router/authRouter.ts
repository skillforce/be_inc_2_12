import { Router } from 'express';
import {
  confirmRegistrationBodyValidators,
  loginBodyValidators,
  logoutRequestValidators,
  meRequestValidators,
  newPasswordBodyValidators,
  recoverPasswordBodyValidators,
  refreshTokenGuard,
  registrationBodyValidators,
  resendRegistrationEmailBodyValidators,
} from '../middlewares/authInputValidationMiddleware';
import { authController } from '../composition-root/auth-composition-root';

export const authRouter = Router({});

authRouter.post('/login', loginBodyValidators, authController.loginUser.bind(authController));

authRouter.get('/me', meRequestValidators, authController.getMe.bind(authController));

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

authRouter.post(
  '/password-recovery',
  recoverPasswordBodyValidators,
  authController.sendRecoveryPasswordEmail.bind(authController),
);
authRouter.post(
  '/new-password',
  newPasswordBodyValidators,
  authController.setNewPasswordByRecoveryCode.bind(authController),
);
