import {
  basicStringFieldMiddlewareGenerator,
  ErrorMessages,
  ObjectIdCheckingErrorMessages,
} from '../../../common/helpers/helper';
import {
  inputValidationMiddleware,
  validateUrlParamId,
} from '../../../common/middlewares/commonValidationMiddlewares';
import { accessTokenGuard } from '../../../application/auth/guards/access.token.guard';

const commentByIdErrors: ObjectIdCheckingErrorMessages = {
  required: 'id is a required URL parameter',
  isMongoId: 'provided id is not valid',
};

const commentBodyContentErrors: ErrorMessages = {
  required: 'content field is required',
  length: 'content should be between 20 and 300 symbols',
  isString: 'content should be provided as a string',
};

export const commentBodyContentValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'content',
  minLength: 20,
  maxLength: 300,
  errorMessages: commentBodyContentErrors,
});

export const getCommentByIdValidators = [validateUrlParamId, inputValidationMiddleware];

export const deleteCommentValidators = [
  accessTokenGuard,
  validateUrlParamId,
  inputValidationMiddleware,
];

export const updateCommentValidators = [
  accessTokenGuard,
  validateUrlParamId,
  commentBodyContentValidationMiddleware,
  inputValidationMiddleware,
];
