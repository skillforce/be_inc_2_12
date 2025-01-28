import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../../middlewares/helper";
import { inputValidationMiddleware } from "../../../middlewares/commonValidationMiddlewares";
import { accessTokenGuard } from "../guards/access.token.guard";


const loginOrEmailErrors: ErrorMessages = {
    required: 'loginOrEmail field is required',
    isString: 'loginOrEmail should be provided as a string'
};

const passwordErrors: ErrorMessages = {
    required: 'password field is required',
    isString: 'password should be provided as a string'
};


export const loginOrEmailBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'loginOrEmail',
    errorMessages: loginOrEmailErrors
});

export const passwordBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'password',
    errorMessages: passwordErrors,
});

export const loginBodyValidators = [
    loginOrEmailBodyValidationMiddleware,
    passwordBodyValidationMiddleware,
    inputValidationMiddleware
]

export const meRequestValidators = [
    accessTokenGuard
]