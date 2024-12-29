import { body, ValidationChain } from 'express-validator';

export interface ErrorMessages {
    required: string;
    length?: string;
    isString: string;
}

export interface BasicStringFieldMiddlewareGeneratorOptions {
    fieldName: string,
    minLength?: number,
    maxLength?: number,
    errorMessages: ErrorMessages,
    extraValidations?: ((chain: ValidationChain) => ValidationChain)[]
}

export const basicStringFieldMiddlewareGenerator = ({
                                                        fieldName,
                                                        minLength,
                                                        maxLength,
                                                        errorMessages,
                                                        extraValidations = []
                                                    }: BasicStringFieldMiddlewareGeneratorOptions): ValidationChain => {
    let validationChain = body(fieldName)
        .exists({checkFalsy: true}).withMessage(errorMessages.required)
        .isString().withMessage(errorMessages.isString)
        .trim()
        .notEmpty().withMessage(errorMessages.required)

    if (minLength !== undefined && maxLength !== undefined) {
        validationChain = validationChain.isLength({ min: minLength, max: maxLength }).withMessage(errorMessages.length || '');
    }


    extraValidations.forEach(rule => {
        validationChain = rule(validationChain);
    });

    return validationChain;
};
