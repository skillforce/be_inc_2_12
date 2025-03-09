import { body, ValidationChain } from 'express-validator';
import { ObjectId } from 'mongodb';
import { ExtensionType } from '../result/result.type';
import dayjs from 'dayjs';

export interface ErrorMessages {
  required: string;
  length?: string;
  invalidValue?: string;
  isString: string;
}

export interface BasicStringFieldMiddlewareGeneratorOptions {
  fieldName: string;
  minLength?: number;
  maxLength?: number;
  errorMessages: ErrorMessages;
  allowedValues?: string[];
  extraValidations?: ((chain: ValidationChain) => ValidationChain)[];
}

export const basicStringFieldMiddlewareGenerator = ({
  fieldName,
  minLength,
  maxLength,
  errorMessages,
  extraValidations = [],
  allowedValues,
}: BasicStringFieldMiddlewareGeneratorOptions): ValidationChain => {
  let validationChain = body(fieldName)
    .exists({ checkFalsy: true })
    .withMessage(errorMessages.required)
    .isString()
    .withMessage(errorMessages.isString)
    .trim()
    .notEmpty()
    .withMessage(errorMessages.required);

  if (minLength !== undefined && maxLength !== undefined) {
    validationChain = validationChain
      .isLength({ min: minLength, max: maxLength })
      .withMessage(errorMessages.length || '');
  }
  if (allowedValues && allowedValues.length > 0) {
    validationChain = validationChain
      .isIn(allowedValues)
      .withMessage(errorMessages.invalidValue || 'Invalid value provided');
  }

  extraValidations.forEach((rule) => {
    validationChain = rule(validationChain);
  });

  return validationChain;
};

export interface ErrorResponseObject {
  errorsMessages: { field: string; message: string }[];
}

export const toObjectId = (id: string): ObjectId | null => {
  if (ObjectId.isValid(id) && id.length === 24) {
    return new ObjectId(id);
  }
  return null;
};

export const createErrorObject = (extensions: ExtensionType[]) => {
  return {
    errorsMessages: extensions,
  };
};

export const generateIsoStringFromSeconds = (seconds: number) => {
  return dayjs(seconds * 1000).toISOString();
};
