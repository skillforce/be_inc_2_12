import { ObjectId } from 'mongodb';
import { UsersRepository } from '../infrastructure/usersRepository';
import { CreateUserDto } from '../types/types';
import { bcryptService } from '../../../common/adapters/bcrypt.service';
import { Result } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { inject, injectable } from 'inversify';
import { UserModel } from '../domain/User.entity';

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}
  async addUser({ login, password, email }: CreateUserDto): Promise<Result<ObjectId | null>> {
    const isCredentialsUnique = await UserModel.isEmailAndLoginUnique({
      email,
      login,
    });

    if (!isCredentialsUnique) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Login and Email must be unique',
        extensions: [
          {
            field: 'login or Email',
            message: 'Login or Email must be unique',
          },
        ],
      };
    }

    const hashedPassword = await bcryptService.generateHash(password);

    const newUser = UserModel.createUser({
      login: login,
      email: email,
      password: hashedPassword,
      isConfirmed: true,
    });

    await this.usersRepository.saveUser(newUser);

    return {
      status: ResultStatus.Success,
      data: newUser._id,
      extensions: [],
    };
  }
  async deleteUser(id: string): Promise<Result<boolean>> {
    const userToDelete = await this.usersRepository.findById(id);

    if (!userToDelete) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'User not found',
        extensions: [],
      };
    }

    await this.usersRepository.deleteUser(userToDelete);

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    };
  }
}
