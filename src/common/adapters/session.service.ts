import session from 'express-session';
import { Request } from 'express';
import { APP_CONFIG } from '../../app_config';
import { v4 } from 'uuid';

const sessionAdapter = {
  createSession(req: Request, deviceId: string): Promise<Request | null> {
    return new Promise((resolve, reject) => {
      req.session.deviceId = deviceId;
      req.session.save((err) => {
        if (err) {
          return reject(null);
        }
        resolve(req);
      });
    });
  },

  prolongSession(req: Request): Promise<Request | null> {
    return new Promise((resolve, reject) => {
      if (req.session) {
        req.session.cookie.maxAge = Number(APP_CONFIG.SESSION_COOKIE_LT);
        req.session.save((err) => {
          if (err) return reject(null);
          resolve(req);
        });
      } else {
        reject(new Error('No active session'));
      }
    });
  },

  getSessionData(req: Request) {
    return req.session ? req.session : null;
  },
};

const sessionMiddleware = session({
  secret: APP_CONFIG.SESSION_COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: Number(APP_CONFIG.SESSION_COOKIE_LT) },
});

export { sessionAdapter, sessionMiddleware };
