import { ValidationChain } from "express-validator";
import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../middlewares/helper";
import {
    inputValidationMiddleware,
    validateUnexpectedFields,
    validateUrlParamId
} from "../../middlewares/commonValidationMiddlewares";
import { db } from "../../db/db";
import { AddUpdatePostRequestRequiredData } from "../types/types";

type PostAllowedKeys = keyof AddUpdatePostRequestRequiredData

const postUpdateVideoAllowedKeys: PostAllowedKeys[] = ["title", "shortDescription", "content", "blogId"]


const postTitleErrors: ErrorMessages = {
    required: 'title field is required',
    length: 'title should be between 1 and 30 symbols',
    isString: 'title should be provided as a string'
};

const postShortDescriptionErrors: ErrorMessages = {
    required: 'shortDescription field is required',
    length: 'shortDescription should be between 1 and 100 symbols',
    isString: 'shortDescription should be provided as a string'
};

const postContentErrors: ErrorMessages = {
    required: 'content field is required',
    length: 'content should be between 1 and 1000 symbols',
    isString: 'content should be provided as a string'
};
const blogIdErrors: ErrorMessages = {
    required: 'blogId field is required',
    isString: 'blogId should be provided as a string'
};

const additionalWebsiteUrlRules: ((chain: ValidationChain) => ValidationChain)[] = [
    (chain) => chain.custom((value) => {
        const blogExists = db.blogs.some(blog => blog.id === value);
        if (!blogExists) {
            throw new Error('Invalid blogId: Blog does not exist');
        }
        return true;
    })
];

export const postTitleBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'title',
    minLength: 1,
    maxLength: 30,
    errorMessages: postTitleErrors
});
export const postShortDescriptionBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'shortDescription',
    minLength: 1,
    maxLength: 100,
    errorMessages: postShortDescriptionErrors
});

export const postContentBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'content',
    minLength: 1,
    maxLength: 1000,
    errorMessages: postContentErrors
});

export const postBlogIdBodyValidationMiddleware = basicStringFieldMiddlewareGenerator({
    fieldName: 'blogId',
    errorMessages: blogIdErrors,
    extraValidations:additionalWebsiteUrlRules
});


export const addPostBodyValidators = [
    validateUnexpectedFields(postUpdateVideoAllowedKeys),
    postTitleBodyValidationMiddleware,
    postShortDescriptionBodyValidationMiddleware,
    postContentBodyValidationMiddleware,
    postBlogIdBodyValidationMiddleware,
    inputValidationMiddleware
]
export const updatePostBodyValidators = [
    validateUrlParamId,
    ...addPostBodyValidators
]