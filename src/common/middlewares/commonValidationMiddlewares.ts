import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import { toObjectId } from '../helpers/helper';
import { BlogQueryRepository } from '../../entities/blogs/repository/blogQueryRepository';
import { CommentsRepository } from '../../entities/comments/repository/commentsRepository';

const blogQueryRepository = new BlogQueryRepository();
const commentRepository = new CommentsRepository();

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMessages = errors.array({ onlyFirstError: true }).map((error) => ({
      message: error.msg,
      field: error.type === 'field' ? error.path : '',
    }));
    res.status(400).json({ errorsMessages });
  } else {
    next();
  }
};

export const validateUrlParamId = (req: Request, res: Response, next: NextFunction) => {
  const paramId = req.params.id;
  if (!paramId) {
    res.status(404);
    return;
  }
  return next();
};

export const checkIfBlogWithProvidedQueryParamIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id;
  if (!paramId) {
    res.sendStatus(404);
    return;
  }
  const _id = toObjectId(paramId);
  if (!_id) {
    return false;
  }
  const isBlogExist = await blogQueryRepository.getBlogById(_id);
  if (!isBlogExist) {
    res.sendStatus(404);
    return;
  }

  return next();
};

export const checkIfCommentWithProvidedQueryParamIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramId = req.params.id;
  if (!paramId) {
    res.sendStatus(404);
    return;
  }
  const _id = toObjectId(paramId);
  if (!_id) {
    res.sendStatus(404);
    return;
  }
  const isCommentExist = await commentRepository.getCommentById(_id);
  if (!isCommentExist) {
    res.sendStatus(404);
    return;
  }

  return next();
};
