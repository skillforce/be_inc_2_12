import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../../middlewares/helper";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { inputValidationMiddleware } from "../../../middlewares/commonValidationMiddlewares";
import {
    postShortDescriptionBodyValidationMiddleware,
    postTitleBodyValidationMiddleware
} from "../../posts/middlewares/postInputValidationMiddleware";


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