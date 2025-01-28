import {
    basicStringFieldMiddlewareGenerator,
    ErrorMessages,
    ObjectIdCheckingErrorMessages,
    objectIdParamMiddlewareGenerator
} from "../../../middlewares/helper";
import { inputValidationMiddleware } from "../../../middlewares/commonValidationMiddlewares";
import { authMiddleware } from "../../../application/auth/guards/base.auth.guard";


const commentByIdErrors:ObjectIdCheckingErrorMessages = {
    required: 'id is a required URL parameter',
    isMongoId: 'provided id is not valid',
};

const commentBodyContentErrors: ErrorMessages = {
    required: 'content field is required',
    length: 'content should be between 20 and 300 symbols',
    isString: 'content should be provided as a string'
};

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
