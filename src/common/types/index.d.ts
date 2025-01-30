import { IdType } from './id';

declare global {
  namespace Express {
    export interface Request {
      user: IdType | undefined;
    }
  }
}
