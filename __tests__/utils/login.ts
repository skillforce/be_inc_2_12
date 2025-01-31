import { PATHS } from '../../src/common/paths/paths';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';

export const loginUser = async ({
  loginOrEmail,
  password,
}: {
  loginOrEmail: string;
  password: string;
}) => {
  const resp = await req
    .post(PATHS.AUTH.LOGIN)
    .send({
      loginOrEmail,
      password,
    })
    .expect(HttpStatuses.Success);
  return resp.body;
};
