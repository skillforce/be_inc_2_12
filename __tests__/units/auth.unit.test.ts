import { jwtService } from '../../src/common/adapters/jwt.service';
import { JwtPayload } from 'jsonwebtoken';
import { authService } from '../../src/application/auth/service/authService';

describe('authService,utils_check', () => {
  const userId = 'testId';
  const accessTokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0SWQiLCJpZCI6ImFhMjRkMTE0LTAwNWMtNGUxMS04ZDU2LWM2ZDk1YTY0ZDk0YiIsImlhdCI6MTczOTc4MTc1NiwiZXhwIjoxNzM5NzgxNzY2fQ.n7aVKMDG7MT3r6OFsVa9KIarnWZ8jQm7fdVZAAnnNJI';
  const refreshTokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0SWQiLCJpZCI6ImUzMzExNmQ0LWQ5MWMtNDFjYy05MDRiLTYyOTg5ODYyOWY1MyIsImlhdCI6MTczOTc4MjU1OCwiZXhwIjoxNzM5NzgyNTc4fQ._zGKrQC5drpOEP0q-0HKC_FXhTr704jcjAFM7VhKCVg';

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
    console.log(sessionBody);
  });
});
