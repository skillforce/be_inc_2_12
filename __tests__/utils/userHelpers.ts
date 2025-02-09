import { testingDtosCreator, UserDto } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';
import { UserDBModel } from '../../src/entities/users';
import { randomUUID } from 'crypto';
import { User } from '../../src/entities/users/service/user.entity';
import { db } from '../../src/db/mongo-db';
import { WithId } from 'mongodb';
import { UserViewModel } from '../../src/entities/users/types/types';

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
}: User): Promise<Omit<UserDBModel, '_id'> & { id: string }> => {
  const newUser = {
    login,
    email,
    password,
    createdAt: createdAt,
    emailConfirmation: {
      ...emailConfirmation,
    },
  };
  const res = await db.getCollections().usersCollection.insertOne({ ...(newUser as WithId<User>) });
  return {
    id: res.insertedId.toString(),
    ...newUser,
  };
};
