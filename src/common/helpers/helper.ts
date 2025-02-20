import { body, ValidationChain } from 'express-validator';
import { ObjectId } from 'mongodb';
import { ExtensionType } from '../result/result.type';
import dayjs from 'dayjs';

export interface ErrorMessages {
  required: string;
  length?: string;
  isString: string;
}

export interface ObjectIdCheckingErrorMessages {
  required: string;
  isMongoId: string;
}

export interface BasicStringFieldMiddlewareGeneratorOptions {
  fieldName: string;
  minLength?: number;
  maxLength?: number;
  errorMessages: ErrorMessages;
  extraValidations?: ((chain: ValidationChain) => ValidationChain)[];
}

export const basicStringFieldMiddlewareGenerator = ({
  fieldName,
  minLength,
  maxLength,
  errorMessages,
  extraValidations = [],
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

export function nanosecondsStringToISOString(nanosecondsStr: string): string {
  const nanoseconds = BigInt(nanosecondsStr);

  // Convert nanoseconds to milliseconds
  const milliseconds = nanoseconds / BigInt(1_000_000);

  // Create Date object based on Unix Epoch (absolute time)
  const date = new Date(
    Number(milliseconds) + Date.now() - Number(process.hrtime.bigint() / BigInt(1_000_000)),
  );

  // Extract remaining nanoseconds for sub-millisecond precision
  const remainingNs = nanoseconds % BigInt(1_000_000_000);
  const fractionalSeconds = `${remainingNs}`.padStart(9, '0').slice(0, 6); // Keep 6 digits (microseconds)

  // Format as ISO 8601 with microseconds
  return `${date.toISOString().replace('Z', '')}.${fractionalSeconds}Z`;
}
