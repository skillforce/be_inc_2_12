import { Request, Response } from 'express';
import { APP_CONFIG } from '../../app_config';

const REFRESH_TOKEN_NAME = 'refreshToken';

export const cookieHandler = {
  setRefreshToken: (res: Response, token: string) => {
    res.cookie(REFRESH_TOKEN_NAME, token, {
      httpOnly: true,
      secure: true,
      maxAge: +APP_CONFIG.RT_TIME,
    });
  },
  getRefreshToken: (req: Request): string | null => {
    return req.cookies?.[REFRESH_TOKEN_NAME] || null;
  },
};
