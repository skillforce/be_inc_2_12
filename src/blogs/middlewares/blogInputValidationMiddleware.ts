import { ValidationChain } from "express-validator";
import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../middlewares/helper";
import { AddUpdateBlogRequestRequiredData } from "../types/types";
import { inputValidationMiddleware, validateUrlParamId } from "../../middlewares/commonValidationMiddlewares";
import { authMiddleware } from "../../middlewares/authMiddleware";

const blogNameErrors: ErrorMessages = {
    required: 'name field is required',
    length: 'name should be between 1 and 15 symbols',
    isString: 'name should be provided as a string'
};

const blogDescriptionErrors: ErrorMessages = {
    required: 'description field is required',
    length: 'description should be between 1 and 500 symbols',
    isString: 'description should be provided as a string'
};

const blogWebsiteUrlErrors: ErrorMessages = {
    required: 'websiteUrl field is required',
    length: 'websiteUrl should be between 1 and 100 symbols',
    isString: 'websiteUrl should be provided as a string'
};

const additionalWebsiteUrlRules: ((chain: ValidationChain) => ValidationChain)[] = [
    (chain) => chain.matches(/^(https?:\/\/)([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9._-]*)*\/?$/).withMessage('wrong website url format')
];

export const blogNameBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'name',
    minLength: 1,
    maxLength: 15,
    errorMessages: blogNameErrors
});
export const blogDescriptionBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'description',
    minLength: 1,
    maxLength: 500,
    errorMessages: blogDescriptionErrors
});
export const blogWebsiteUrlBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'websiteUrl',
    minLength: 1,
    maxLength: 100,
    errorMessages: blogWebsiteUrlErrors,
    extraValidations: additionalWebsiteUrlRules
});


export const addBlogBodyValidators = [
    authMiddleware,
    blogNameBodyValidationMiddleware,
    blogDescriptionBodyValidationMiddleware,
    blogWebsiteUrlBodyValidationMiddleware,
    inputValidationMiddleware
]

export const deleteBlogValidators = [
    authMiddleware,
    validateUrlParamId,
]

export const updateBlogBodyValidators = [
    ...deleteBlogValidators,
    ...addBlogBodyValidators
]
