import { testingDtosCreator, UserDto } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { UserDBModel, UserModel } from '../../src/entities/users';
import { CodeConfirmation, UserViewModel } from '../../src/entities/users/types/types';
import { Response } from 'supertest';

type CreateUserParams = {
  userDto?: UserDto;
  expectedHttpStatus?: HttpStatuses;
};

export const createUser = async ({
  userDto,
  expectedHttpStatus = HttpStatuses.Created,
}: CreateUserParams): Promise<UserViewModel> => {
  const dto = userDto ?? testingDtosCreator.createUserDto({});

  const resp = await req
    .post(PATHS.USERS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send({
      login: dto.login,
      email: dto.email,
      password: dto.pass,
    })
    .expect(expectedHttpStatus);
  return resp.body;
};

export const insertUser = async ({
  emailConfirmation,
  password,
  email,
  createdAt,
  login,
}: {
  emailConfirmation: CodeConfirmation;
  password: string;
  email: string;
  createdAt: string;
  login: string;
}): Promise<Omit<UserDBModel, '_id'> & { id: string }> => {
  const newUser = {
    login,
    email,
    password,
    createdAt: createdAt,
    emailConfirmation: {
      ...emailConfirmation,
    },
    recoverPasswordEmailConfirmation: null,
  };
  const res = await UserModel.create(newUser);
  return {
    id: res._id.toString(),
    ...newUser,
  };
};

export const getUserFromDBByEmail = async ({
  email,
}: {
  email: string;
}): Promise<UserDBModel | null> => {
  const res = await UserModel.findOne({ email });
  if (!res) return null;

  return res;
};

export const createAndLoginUser = async (userDto?: UserDto): Promise<Response> => {
  const dto = userDto ?? testingDtosCreator.createUserDto({});
  await createUser({ userDto: dto });
  return req
    .post(PATHS.AUTH.LOGIN)
    .send({
      loginOrEmail: dto.login,
      password: dto.pass,
    })
    .expect(200);
};
