import { validationResult, ValidationError, body, query, param } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { blogRepository } from "../entities/blogs/repository/blogRepository";
import { toObjectId } from "../helpers/helpers";
import { blogService } from "../entities/blogs/domain/blogService";


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

export const checkIfBlogWithProvidedQueryParamIdExists =async (req: Request, res: Response, next: NextFunction)=>{
  const paramId = req.params.id;
  if(!paramId){
      res.sendStatus(404)
      return;
  }
    const isBlogExist= await blogService.getBlogById(paramId);
  if(!isBlogExist){
      res.sendStatus(404)
      return;
  }

   return next();
  }