import { validationResult, ValidationError, body } from "express-validator";
import { NextFunction, Request, Response } from "express";


export const inputValidationMiddleware = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsMessages = errors.array({ onlyFirstError: true }).map(error => ({
                message:error.msg,
                field:error.type==='field' ? error.path : ''
        }));
        res.status(400).json({errorsMessages});
    }else{
        next()
    }
}

export const validateUrlParamId =(req: Request, res: Response, next: NextFunction)=>{
  const paramId = req.params.id;
  if(!paramId){
      res.status(404)
      return;
  }
    return next();

  }


export const validateUnexpectedFields = (allowedFields: string[]) => {
    return body()
        .custom((value, { req }) => {
            const bodyKeys = Object.keys(req.body);
            const unexpectedFields = bodyKeys.filter(
                (key) => !allowedFields.includes(key)
            );

            if (unexpectedFields.length > 0) {
                throw new Error(
                    `Unexpected fields: ${unexpectedFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`
                );
            }
            return true;
        });
};