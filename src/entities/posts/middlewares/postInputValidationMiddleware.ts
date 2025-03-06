import { ValidationChain } from 'express-validator';
import { basicStringFieldMiddlewareGenerator, ErrorMessages } from '../../../common/helpers/helper';
import {
  checkIfBlogWithProvidedQueryParamIdExists,
  inputValidationMiddleware,
  validateUrlParamId,
} from '../../../common/middlewares/commonValidationMiddlewares';
import { authMiddleware } from '../../../application/auth/guards/base.auth.guard';
import { accessTokenGuard } from '../../../application/auth/guards/access.token.guard';
import { BlogService } from '../../blogs/service/blogService';
import { ResultStatus } from '../../../common/result/resultCode';
import { BlogRepository } from '../../blogs/repository/blogRepository';

const blogRepository = new BlogRepository();
const blogService = new BlogService(blogRepository);

const postTitleErrors: ErrorMessages = {
  required: 'title field is required',
  length: 'title should be between 1 and 30 symbols',
  isString: 'title should be provided as a string',
};

const postShortDescriptionErrors: ErrorMessages = {
  required: 'shortDescription field is required',
  length: 'shortDescription should be between 1 and 100 symbols',
  isString: 'shortDescription should be provided as a string',
};

const postContentErrors: ErrorMessages = {
  required: 'content field is required',
  length: 'content should be between 1 and 1000 symbols',
  isString: 'content should be provided as a string',
};
const blogIdErrors: ErrorMessages = {
  required: 'blogId field is required',
  isString: 'blogId should be provided as a string',
};

const createCommentBodyContentErrors: ErrorMessages = {
  required: 'content field is required',
  length: 'content should be between 20 and 300 symbols',
  isString: 'content should be provided as a string',
};

const additionalWebsiteUrlRules: ((chain: ValidationChain) => ValidationChain)[] = [
  (chain) =>
    chain.custom(async (value) => {
      const blogCheckResult = await blogService.checkIsBlogWithIdExist(value);
      if (blogCheckResult.status !== ResultStatus.Success) {
        throw new Error('Invalid blogId: Blog does not exist');
      }
      return true;
    }),
];

export const postTitleBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'title',
  minLength: 1,
  maxLength: 30,
  errorMessages: postTitleErrors,
});
export const postShortDescriptionBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'shortDescription',
  minLength: 1,
  maxLength: 100,
  errorMessages: postShortDescriptionErrors,
});

export const postContentBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'content',
  minLength: 1,
  maxLength: 1000,
  errorMessages: postContentErrors,
});

export const postBlogIdBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
  fieldName: 'blogId',
  errorMessages: blogIdErrors,
  extraValidations: additionalWebsiteUrlRules,
});

export const createCommentByPostIdBodyContentValidationMiddleware =
  basicStringFieldMiddlewareGenerator({
    fieldName: 'content',
    maxLength: 300,
    minLength: 20,
    errorMessages: createCommentBodyContentErrors,
  });

export const addPostBodyValidators = [
  authMiddleware,
  postTitleBodyValidationMiddleware,
  postShortDescriptionBodyValidationMiddleware,
  postContentBodyValidationMiddleware,
  postBlogIdBodyValidationMiddleware,
  inputValidationMiddleware,
];

export const getPostsByBlogIdValidators = [
  checkIfBlogWithProvidedQueryParamIdExists,
  inputValidationMiddleware,
];

export const createPostByBlogIdValidators = [
  authMiddleware,
  postTitleBodyValidationMiddleware,
  postShortDescriptionBodyValidationMiddleware,
  postContentBodyValidationMiddleware,
  checkIfBlogWithProvidedQueryParamIdExists,
  inputValidationMiddleware,
];

export const deletePostValidators = [authMiddleware, validateUrlParamId];
export const updatePostBodyValidators = [...deletePostValidators, ...addPostBodyValidators];

export const getCommentByPostIdValidators = [validateUrlParamId];
export const createCommentByPostIdValidators = [
  accessTokenGuard,
  createCommentByPostIdBodyContentValidationMiddleware,
  inputValidationMiddleware,
];
