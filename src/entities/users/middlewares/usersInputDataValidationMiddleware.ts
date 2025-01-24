import { authMiddleware } from "../../../middlewares/authMiddleware";
import { inputValidationMiddleware, validateUrlParamId } from "../../../middlewares/commonValidationMiddlewares";
import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../../middlewares/helper";
import { ValidationChain } from "express-validator";

const userLoginErrors: ErrorMessages = {
    required: 'login field is required',
    length: 'login length should be between 3 and 10 symbols',
    isString: 'login should be provided as a string'
};
const userEmailErrors: ErrorMessages = {
    required: 'email field is required',
    isString: 'email should be provided as a string'
};

const userPasswordErrors: ErrorMessages = {
    required: 'password field is required',
    length: 'password length should be between 6 and 20 symbols',
    isString: 'password should be provided as a string'
};

const additionalLoginRules: ((chain: ValidationChain) => ValidationChain)[] = [
    (chain) => chain.matches(/^[a-zA-Z0-9_-]*$/).withMessage('wrong login format')
];

const additionalEmailRules: ((chain: ValidationChain) => ValidationChain)[] = [
    (chain) => chain.matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('wrong email format')
];

export const userLoginBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'login',
    minLength: 3,
    maxLength: 10,
    errorMessages: userLoginErrors,
    extraValidations: additionalLoginRules
});

export const userPasswordBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'password',
    minLength: 6,
    maxLength: 20,
    errorMessages: userPasswordErrors,
});

export const userEmailBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'email',
    errorMessages: userEmailErrors,
    extraValidations: additionalEmailRules
});

export const getUsersValidators = [
    authMiddleware,
]


export const addUserBodyValidators = [
    authMiddleware,
    userLoginBodyValidationMiddleware,
    userEmailBodyValidationMiddleware,
    userPasswordBodyValidationMiddleware,
    inputValidationMiddleware
]

export const deleteUserValidators = [
    authMiddleware,
    validateUrlParamId,
]