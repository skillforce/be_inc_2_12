import { config } from 'dotenv';

config();

export const APP_CONFIG = {
  PORT: process.env.PORT || 3003,
  ADMIN_AUTH: process.env.BASIC_AUTH_CREDENTIALS as string,
  MONGO_URL: process.env.MONGO_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,
  BLOG_COLLECTION_NAME: process.env.BLOG_COLLECTION_NAME as string,
  POST_COLLECTION_NAME: process.env.POST_COLLECTION_NAME as string,
  USERS_COLLECTION_NAME: process.env.USERS_COLLECTION_NAME as string,
  COMMENTS_COLLECTION_NAME: process.env.COMMENTS_COLLECTION_NAME as string,
};
