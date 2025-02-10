import { Request, Response } from 'express';
const REFRESH_TOKEN_NAME = 'refreshToken';

export const cookieHandler = {
  setRefreshToken: (res: Response, token: string) => {
    res.cookie(REFRESH_TOKEN_NAME, token, {
      httpOnly: true,
      secure: true,
    });
  },
  getRefreshToken: (req: Request): string | null => {
    return req.cookies?.[REFRESH_TOKEN_NAME] || null;
  },
};
