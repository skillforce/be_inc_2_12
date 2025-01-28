import { config } from 'dotenv'

config();

export const APP_CONFIG = {
    PORT: process.env.PORT || 3003,
    ADMIN_AUTH: 'admin:qwerty',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    DB_NAME: process.env.DB_NAME || 'mydb',
    AC_SECRET: process.env.AC_SECRET || 'secret' as string,
    AC_TIME: process.env.AC_TIME || 300,
    BLOG_COLLECTION_NAME: process.env.BLOG_COLLECTION_NAME || 'blogs',
    POST_COLLECTION_NAME: process.env.POST_COLLECTION_NAME || 'posts',
    USERS_COLLECTION_NAME: process.env.USERS_COLLECTION_NAME || 'comments',
    COMMENTS_COLLECTION_NAME: process.env.COMMENTS_COLLECTION_NAME || 'users',
}