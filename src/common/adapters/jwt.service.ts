import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../app_config';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  deviceId: string;
  internalId: string;
}

export class JwtService {
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId, internalId: uuidv4() }, APP_CONFIG.AC_SECRET, {
      expiresIn: APP_CONFIG.AC_TIME as unknown as number,
    });
  }
  async createRefreshToken(userId: string, deviceId?: string): Promise<string> {
    return jwt.sign(
      { userId, deviceId: deviceId ?? uuidv4(), internalId: uuidv4() },
      APP_CONFIG.RT_SECRET,
      {
        expiresIn: APP_CONFIG.RT_TIME as unknown as number,
      },
    );
  }
  async decodeToken(token: string): Promise<CustomJwtPayload | null> {
    try {
      return jwt.decode(token) as CustomJwtPayload | null;
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  }
  async getRefreshTokenVersion(token: string): Promise<string | null> {
    try {
      const decodedToken = await this.decodeToken(token);
      if (decodedToken && typeof decodedToken !== 'string' && decodedToken.iat) {
        return decodedToken.iat.toString();
      }
      return null;
    } catch (error) {
      console.error('Error in getRefreshTokenVersion:', error);
      return null;
    }
  }
  async verifyAccessToken(token: string): Promise<{ userId: string; internalId: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.AC_SECRET) as {
        userId: string;
        internalId: string;
      };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  }
  async verifyRefreshToken(
    token: string,
  ): Promise<{ userId: string; deviceId: string; internalId: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.RT_SECRET) as {
        userId: string;
        deviceId: string;
        internalId: string;
      };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  }
}

export const jwtService = new JwtService();
