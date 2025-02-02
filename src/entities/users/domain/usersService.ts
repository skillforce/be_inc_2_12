import { ObjectId } from 'mongodb';
import { usersRepository } from '../repository/usersRepository';
import { AddUserDto, AddUserRequiredInputData } from '../types/types';

import { bcryptService } from '../../../common/adapters/bcrypt.service';
import { toObjectId } from '../../../common/middlewares/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';

export const usersService = {
  addUser: async ({
    login,
    password,
    email,
  }: AddUserRequiredInputData): Promise<Result<ObjectId | null>> => {
    const isLoginUnique = await usersRepository.isFieldValueUnique('login', login); //search by both fields login and email
    const isEmailUnique = await usersRepository.isFieldValueUnique('email', email);

    if (!isLoginUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Login must be unique',
        extensions: [
          {
            field: 'login',
            message: 'Login must be unique',
          },
        ],
      };
    }

    if (!isEmailUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Email must be unique',
        extensions: [
          {
            field: 'email',
            message: 'Email must be unique',
          },
        ],
      };
    }

    const hashedPassword = await bcryptService.generateHash(password);

    const newBlogData: AddUserDto = {
      login,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const createdBlogId = await usersRepository.addUser(newBlogData);

    if (!createdBlogId) {
      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal server error occurred',
        data: null,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: createdBlogId,
      extensions: [],
    };
  },

  deleteUser: async (id: string): Promise<Result<boolean>> => {
    const _id = toObjectId(id);

    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'User not found',
        extensions: [],
      };
    }

    const isUserDeleted = await usersRepository.deleteUser(_id);
    if (!isUserDeleted) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'User not found',
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: isUserDeleted,
      extensions: [],
    };
  },
};
