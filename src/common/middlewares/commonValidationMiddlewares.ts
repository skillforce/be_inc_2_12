import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import { toObjectId } from '../helpers/helper';
import { BlogQueryRepository } from '../../entities/blogs/infrastructure/blogQueryRepository';
import { CommentsRepository } from '../../entities/comments/infrastructure/commentsRepository';
import { jwtService } from '../adapters/jwt.service';
import { IdType } from '../types/id';
import { UsersRepository } from '../../entities/users/infrastructure/usersRepository';

const blogQueryRepository = new BlogQueryRepository();
const commentRepository = new CommentsRepository();
const usersRepository = new UsersRepository();

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

export const accessTokenGuardNotStrict = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization) {
    return next();
  }

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') {
    return next();
  }

  const payload = await jwtService.verifyAccessToken(token);
  if (!payload) {
    return next();
  }

  const { userId } = payload;

  const doesUserExist = await usersRepository.findById(userId);
  if (!doesUserExist) {
    return next();
  }

  req.user = { id: userId } as IdType;

  next();
};
