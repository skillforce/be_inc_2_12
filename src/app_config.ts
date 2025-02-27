import { config } from 'dotenv';

config();

export class AppConfig {
  public readonly PORT: number;
  public readonly ADMIN_AUTH: string;
  public readonly MONGO_URL: string;
  public readonly DB_NAME: string;
  public readonly AC_SECRET: string;
  public readonly AC_TIME: string;
  public readonly RT_SECRET: string;
  public readonly RT_TIME: string;
  public readonly EMAIL: string;
  public readonly EMAIL_PASS: string;
  public readonly EMAIL_SERVICE: string;
  public readonly BLOG_COLLECTION_NAME: string;
  public readonly POST_COLLECTION_NAME: string;
  public readonly USERS_COLLECTION_NAME: string;
  public readonly COMMENTS_COLLECTION_NAME: string;
  public readonly AUTH_META_COLLECTION_NAME: string;
  public readonly TRIGGER_ATTEMPTS_COLLECTION: string;

  constructor(private env: NodeJS.ProcessEnv) {
    this.PORT = Number(env.PORT) || 3003;
    this.ADMIN_AUTH = env.BASIC_AUTH_CREDENTIALS || '';
    this.MONGO_URL = env.MONGO_URL || '';
    this.DB_NAME = env.DB_NAME || '';
    this.AC_SECRET = env.AC_SECRET || '';
    this.AC_TIME = env.AC_TIME || '';
    this.RT_SECRET = env.RT_SECRET || '';
    this.RT_TIME = env.RT_TIME || '';
    this.EMAIL = env.EMAIL || '';
    this.EMAIL_PASS = env.EMAIL_PASS || '';
    this.EMAIL_SERVICE = env.EMAIL_SERVICE || '';
    this.BLOG_COLLECTION_NAME = env.BLOG_COLLECTION_NAME || '';
    this.POST_COLLECTION_NAME = env.POST_COLLECTION_NAME || '';
    this.USERS_COLLECTION_NAME = env.USERS_COLLECTION_NAME || '';
    this.COMMENTS_COLLECTION_NAME = env.COMMENTS_COLLECTION_NAME || '';
    this.AUTH_META_COLLECTION_NAME = env.AUTH_META_COLLECTION_NAME || '';
    this.TRIGGER_ATTEMPTS_COLLECTION = env.TRIGGER_ATTEMPTS_COLLECTION || '';
  }
}

export const APP_CONFIG = new AppConfig(process.env);
