import { basicStringFieldMiddlewareGenerator, ErrorMessages } from '../../../common/helpers/helper';
import {
  accessTokenGuardNotStrict,
  checkIfCommentWithProvidedQueryParamIdExists,
  inputValidationMiddleware,
  validateUrlParamId,
} from '../../../common/middlewares/commonValidationMiddlewares';
import { accessTokenGuard } from '../../../application/auth/guards/access.token.guard';

const commentBodyContentErrors: ErrorMessages = {
  required: 'content field is required',
  length: 'content should be between 20 and 300 symbols',
  isString: 'content should be provided as a string',
};
const commentBodyLikeStatusErrors: ErrorMessages = {
  required: 'likeStatus field is required',
  isString: 'likeStatus should be provided as a string',
  invalidValue: 'likeStatus should be "None", "Like" or "Dislike"',
};

export const commentBodyContentValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'content',
  minLength: 20,
  maxLength: 300,
  errorMessages: commentBodyContentErrors,
});

export const commentBodyLikeStatusValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'likeStatus',
  allowedValues: ['None', 'Like', 'Dislike'],
  errorMessages: commentBodyLikeStatusErrors,
});

export const getCommentByIdValidators = [
  accessTokenGuardNotStrict,
  validateUrlParamId,
  inputValidationMiddleware,
];

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
export const updateCommentLikeStatusValidators = [
  accessTokenGuard,
  checkIfCommentWithProvidedQueryParamIdExists,
  commentBodyLikeStatusValidationMiddleware,
  inputValidationMiddleware,
];
