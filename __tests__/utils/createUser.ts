import request from 'supertest';

import { BlogDto, testingDtosCreator, UserDto } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';

export const createUser = async (app: any, userDto?: UserDto) => {
  const dto = userDto ?? testingDtosCreator.createUserDto({});

  const resp = await request(app)
    .post(PATHS.USERS)
    .set('Authorization', ADMIN_AUTH_HEADER)
    .send({
      login: dto.login,
      email: dto.email,
      password: dto.pass,
    })
    .expect(201);
  return resp.body;
};
