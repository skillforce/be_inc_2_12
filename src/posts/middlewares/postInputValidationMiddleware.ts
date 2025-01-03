import { ValidationChain } from "express-validator";
import { basicStringFieldMiddlewareGenerator, ErrorMessages } from "../../middlewares/helper";
import { inputValidationMiddleware, validateUrlParamId } from "../../middlewares/commonValidationMiddlewares";
import { db } from "../../db/db";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { blogRepository } from "../../blogs/repository/blogRepository";


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
    (chain) => chain.custom(async (value) => {
        const blogs = await blogRepository.getAllBlogs()
        const blogExists = blogs.some(blog => blog._id.toString() === value);
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
    authMiddleware,
    postTitleBodyValidationMiddleware,
    postShortDescriptionBodyValidationMiddleware,
    postContentBodyValidationMiddleware,
    postBlogIdBodyValidationMiddleware,
    inputValidationMiddleware
]
export const deletePostValidators = [
    authMiddleware,
    validateUrlParamId,
]
export const updatePostBodyValidators = [
    ...deletePostValidators,
    ...addPostBodyValidators
]
