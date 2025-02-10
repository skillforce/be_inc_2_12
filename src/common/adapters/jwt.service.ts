import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../app_config';

export const jwtService = {
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId, id: uuidv4() }, APP_CONFIG.AC_SECRET, {
      expiresIn: +APP_CONFIG.AC_TIME,
    });
  },
  async createRefreshToken(userId: string): Promise<string> {
    return jwt.sign({ userId, id: uuidv4() }, APP_CONFIG.RT_SECRET, {
      expiresIn: +APP_CONFIG.RT_TIME,
    });
  },
  async decodeToken(token: string): Promise<any> {
    try {
      return jwt.decode(token);
    } catch (e: unknown) {
      console.error("Can't decode token", e);
      return null;
    }
  },
  async verifyAccessToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.AC_SECRET) as { userId: string; id: string };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  },
  async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, APP_CONFIG.RT_SECRET) as { userId: string; id: string };
    } catch (error) {
      console.error('Token verify some error');
      return null;
    }
  },
};
