import { testingDtosCreator, UserDto } from './testingDtosCreator';
import { PATHS } from '../../src/common/paths/paths';
import { ADMIN_AUTH_HEADER } from '../../src/application/auth/guards/base.auth.guard';
import { req } from './test-helpers';

export const createUser = async (userDto?: UserDto) => {
  const dto = userDto ?? testingDtosCreator.createUserDto({});

  const resp = await req
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
