import {
    basicStringFieldMiddlewareGenerator,
    ErrorMessages,
    ObjectIdCheckingErrorMessages,
    objectIdParamMiddlewareGenerator
} from "../../../middlewares/helper";
import { inputValidationMiddleware } from "../../../middlewares/commonValidationMiddlewares";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const blogNameErrors: ErrorMessages = {
    required: 'name field is required',
    length: 'name should be between 1 and 15 symbols',
    isString: 'name should be provided as a string'
};

const commentByIdErrors:ObjectIdCheckingErrorMessages = {
    required: 'id is a required URL parameter',
    isMongoId: 'provided id is not valid',
};
//
// const blogDescriptionErrors: ErrorMessages = {
//     required: 'description field is required',
//     length: 'description should be between 1 and 500 symbols',
//     isString: 'description should be provided as a string'
// };
//
const commentBodyContentErrors: ErrorMessages = {
    required: 'content field is required',
    length: 'content should be between 20 and 300 symbols',
    isString: 'content should be provided as a string'
};

// const additionalWebsiteUrlRules: ((chain: ValidationChain) => ValidationChain)[] = [
//     (chain) => chain.matches(/^(https?:\/\/)([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9._-]*)*\/?$/).withMessage('wrong website url format')
// ];

// export const blogNameBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
//     fieldName: 'name',
//     minLength: 1,
//     maxLength: 15,
//     errorMessages: blogNameErrors
// });
// export const blogDescriptionBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
//     fieldName: 'description',
//     minLength: 1,
//     maxLength: 500,
//     errorMessages: blogDescriptionErrors
// });
export const commentBodyContentValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'content',
    minLength: 20,
    maxLength: 300,
    errorMessages: commentBodyContentErrors,
});

const commentByIdUrlParamCheckMiddleware = objectIdParamMiddlewareGenerator({paramName:'id', errorMessages: commentByIdErrors})

export const getCommentByIdValidators = [
    authMiddleware,
    commentByIdUrlParamCheckMiddleware,
    inputValidationMiddleware
]

export const deleteCommentValidators = [
    authMiddleware,
    commentByIdUrlParamCheckMiddleware,
    inputValidationMiddleware
]

export const updateCommentValidators = [
    authMiddleware,
    commentByIdUrlParamCheckMiddleware,
    commentBodyContentValidationMiddleware,
    inputValidationMiddleware
]
