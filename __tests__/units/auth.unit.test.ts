import { jwtService } from '../../src/common/adapters/jwt.service';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from '../../src/application/auth/service/authService';
import { AuthRepository } from '../../src/application/auth/repository/authRepository';
import { UsersRepository } from '../../src/entities/users/infrastructure/usersRepository';

const authRepository = new AuthRepository();
const userRepository = new UsersRepository();
const authService = new AuthService(authRepository, userRepository);

describe('authService,utils_check', () => {
  const userId = 'testId';
  const refreshTokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0SWQiLCJkZXZpY2VJZCI6ImNmZDgxZjVkLWViNmQtNGE0MS04NDM1LTM2NjUwNjA4NGY0ZCIsImludGVybmFsSWQiOiIwOTViMzczZS03ODU2LTQwM2UtYjAyYi0xNDAzOThiNGMwNDAiLCJpYXQiOjE3NDE1OTQ2NjcsImV4cCI6MTc0MTU5NDY4N30.CqzDaDtSjILlJM5Sn6Y-X3hwLkTsPIVdW5QpfcUyLXQ';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate valid access and refresh tokens', async () => {
    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(userId);

    const decodedAccessToken = (await jwtService.decodeToken(accessToken)) as JwtPayload;
    const decodedRefreshToken = (await jwtService.decodeToken(refreshToken)) as JwtPayload;

    expect(decodedAccessToken).not.toBeUndefined();
    expect(decodedRefreshToken).not.toBeUndefined();

    expect(decodedAccessToken?.userId).toBe(userId);
    expect(decodedRefreshToken?.userId).toBe(userId);
    expect(decodedAccessToken?.iat).toBeDefined();
    expect(decodedRefreshToken?.iat).toBeDefined();
    expect(decodedRefreshToken?.exp).toBeDefined();
    expect(decodedAccessToken?.exp).toBeDefined();
  });
  it('should generate valid sessionBody', async () => {
    const sessionBody = await authService.generateSessionBody(
      refreshTokenMock,
      'deviceName',
      '127.0.0.1',
    );

    expect(sessionBody).not.toBeUndefined();
    expect(sessionBody?.data?.iat).not.toBeUndefined();
    expect(sessionBody?.data?.exp).not.toBeUndefined();
    expect(sessionBody?.data?.device_name).not.toBeUndefined();
    expect(sessionBody?.data?.device_id).not.toBeUndefined();
    expect(sessionBody?.data?.ip_address).not.toBeUndefined();
    expect(sessionBody?.data?.user_id).not.toBeUndefined();
  });
});
