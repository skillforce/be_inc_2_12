import { Router } from 'express';
import {
  addUserBodyValidators,
  deleteUserValidators,
  getUsersValidators,
} from '../middlewares/usersInputDataValidationMiddleware';
import { userController } from '../compositions-root/users-composition-root';

export const usersRouter = Router({});
console.log(userController.createUser.bind(userController));

usersRouter.get('/', getUsersValidators, userController.getUsers.bind(userController));

usersRouter.post('/', addUserBodyValidators, userController.createUser.bind(userController));

usersRouter.delete('/:id', deleteUserValidators, userController.deleteUser.bind(userController));
