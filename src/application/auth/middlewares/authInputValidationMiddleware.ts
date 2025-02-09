import { basicStringFieldMiddlewareGenerator, ErrorMessages } from '../../../common/helpers/helper';
import { inputValidationMiddleware } from '../../../common/middlewares/commonValidationMiddlewares';
import { accessTokenGuard } from '../guards/access.token.guard';
import { ValidationChain } from 'express-validator';

const loginOrEmailErrors: ErrorMessages = {
  required: 'loginOrEmail field is required',
  isString: 'loginOrEmail should be provided as a string',
};

const emailErrors: ErrorMessages = {
  required: 'email field is required',
  isString: 'email should be provided as a string',
};
const loginErrors: ErrorMessages = {
  required: 'login field is required',
  isString: 'login should be provided as a string',
  length: 'login field length should be between 3 and 10 symbols',
};

const passwordErrors: ErrorMessages = {
  required: 'password field is required',
  isString: 'password should be provided as a string',
  length: 'password field length should be between 6 and 20 symbols',
};
const codeErrors: ErrorMessages = {
  required: 'code field is required',
  isString: 'code should be provided as a string',
};

const additionalLoginRules: ((chain: ValidationChain) => ValidationChain)[] = [
  (chain) => chain.matches(/^[a-zA-Z0-9_-]*$/).withMessage('wrong login format'),
];
const additionalEmailRules: ((chain: ValidationChain) => ValidationChain)[] = [
  (chain) => chain.matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('wrong email format'),
];

export const loginOrEmailBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'loginOrEmail',
  errorMessages: loginOrEmailErrors,
});

export const loginBodyRegistrationValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'login',
  errorMessages: loginErrors,
  minLength: 3,
  maxLength: 10,
  extraValidations: additionalLoginRules,
});
export const emailBodyRegistrationValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'email',
  errorMessages: emailErrors,
  extraValidations: additionalEmailRules,
});

export const passwordLoginBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'password',
  errorMessages: passwordErrors,
});
export const codeBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'code',
  errorMessages: codeErrors,
});
export const passwordRegistrationBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'password',
  errorMessages: passwordErrors,
  maxLength: 20,
  minLength: 6,
});

export const loginBodyValidators = [
  loginOrEmailBodyValidationMiddleware,
  passwordLoginBodyValidationMiddleware,
  inputValidationMiddleware,
];
export const refreshTokenBodyValidators = [accessTokenGuard];
export const logoutBodyValidators = [accessTokenGuard];

export const registrationBodyValidators = [
  loginBodyRegistrationValidationMiddleware,
  passwordRegistrationBodyValidationMiddleware,
  emailBodyRegistrationValidationMiddleware,
  inputValidationMiddleware,
];

export const confirmRegistrationBodyValidators = [
  codeBodyValidationMiddleware,
  inputValidationMiddleware,
];
export const resendRegistrationEmailBodyValidators = [
  emailBodyRegistrationValidationMiddleware,
  inputValidationMiddleware,
];

export const meRequestValidators = [accessTokenGuard];
