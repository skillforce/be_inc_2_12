import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../app_config';

export interface TokenBodyPayload {
  userId: string;
  id: string;
  iat: string;
  exp: string;
}

export const jwtService = {
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId, internalId: uuidv4() }, APP_CONFIG.AC_SECRET, {
      expiresIn: +APP_CONFIG.AC_TIME,
    });
  },
  async createRefreshToken(userId: string, deviceId?: string): Promise<string> {
    const nowNs = process.hrtime.bigint();
    return jwt.sign(
      { userId, deviceId: deviceId ?? uuidv4(), iat_ns: nowNs.toString() },
      APP_CONFIG.RT_SECRET,
      {
        expiresIn: +APP_CONFIG.RT_TIME,
      },
    );
  },
  async decodeToken(token: string): Promise<JwtPayload | null | string> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async getRefreshTokenVersion(token: string): Promise<string | null> {
    try {
      const decodedToken = await this.decodeToken(token);
      if (decodedToken && typeof decodedToken !== 'string' && decodedToken.iat_ns) {
        return decodedToken.iat_ns;
      }
      return null;
    } catch (error) {
      console.error('Error in getRefreshTokenVersion:', error);
      return null;
    }
  },
  async getRefreshTokenDeviceId(token: string): Promise<string | null> {
    try {
      const decodedToken = await this.decodeToken(token);
      if (decodedToken && typeof decodedToken !== 'string' && decodedToken.deviceId) {
        return decodedToken.deviceId.toString();
      }
      return null;
    } catch (error) {
      console.error('Error in getRefreshTokenVersion:', error);
      return null;
    }
  },
  async verifyAccessToken(token: string): Promise<{ userId: string; internalId: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.AC_SECRET) as { userId: string; internalId: string };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  },
  async verifyRefreshToken(
    token: string,
  ): Promise<{ userId: string; deviceId: string; iat_ns: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.RT_SECRET) as {
        userId: string;
        deviceId: string;
        iat_ns: string;
      };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  },
};
