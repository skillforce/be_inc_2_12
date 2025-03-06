import { ObjectId } from 'mongodb';
import { UsersRepository } from '../repository/usersRepository';
import { AddUserDto, AddUserRequiredInputData } from '../types/types';
import { bcryptService } from '../../../common/adapters/bcrypt.service';
import { toObjectId } from '../../../common/helpers/helper';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { User } from './user.entity';
import { inject, injectable } from 'inversify';

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}
  async addUser({
    login,
    password,
    email,
  }: AddUserRequiredInputData): Promise<Result<ObjectId | null>> {
    const isLoginUnique = await this.usersRepository.isFieldValueUnique('login', login);
    const isEmailUnique = await this.usersRepository.isFieldValueUnique('email', email);

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

    const newUser: AddUserDto = new User({
      login: login,
      email: email,
      hash: hashedPassword,
      isConfirmed: true,
    });

    const createdUserId = await this.usersRepository.addUser(newUser);

    if (!createdUserId) {
      return {
        status: ResultStatus.ServerError,
        errorMessage: 'Internal server error occurred',
        data: null,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.Success,
      data: createdUserId,
      extensions: [],
    };
  }
  async deleteUser(id: string): Promise<Result<boolean>> {
    const _id = toObjectId(id);

    if (!_id) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'User not found',
        extensions: [],
      };
    }

    const isUserDeleted = await this.usersRepository.deleteUser(_id);
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
  }
}
