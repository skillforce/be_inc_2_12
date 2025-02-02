import { PATHS } from '../../src/common/paths/paths';
import { req } from './test-helpers';
import { HttpStatuses } from '../../src/common/types/httpStatuses';

type LoginUser = {
  loginData: {
    loginOrEmail: string;
    password: string;
  };
  expectedHttpStatus?: HttpStatuses;
};

export const loginUser = async ({
  loginData,
  expectedHttpStatus = HttpStatuses.Success,
}: LoginUser) => {
  const resp = await req
    .post(PATHS.AUTH.LOGIN)
    .send({
      ...loginData,
    })
    .expect(expectedHttpStatus);
  return resp.body;
};
