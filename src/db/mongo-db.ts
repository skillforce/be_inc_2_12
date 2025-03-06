import { PostModel } from '../entities/posts';
import { BlogModel } from '../entities/blogs';
import { UserModel } from '../entities/users';
import { AppConfig } from '../app_config';
import { CommentModel } from '../entities/comments';
import { injectable } from 'inversify';
import * as mongoose from 'mongoose';
import { AuthMetaModel, TriggerAttemptsModel } from '../application/auth';

@injectable()
export class DataBase {
  public client?: mongoose.Mongoose;

  constructor(protected appConfig: AppConfig) {}

  async connect(url: string) {
    try {
      this.client = await mongoose.connect(url, {
        dbName: this.appConfig.DB_NAME,
      } as mongoose.ConnectOptions);

      console.log('✅ Connected to MongoDB using Mongoose');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      await this.disconnect();
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      console.log('🔴 Disconnected from MongoDB');
    } else {
      console.log('🔴 No active connection to disconnect.');
    }
  }

  async clearDatabase() {
    try {
      await this.client?.connection.db?.dropDatabase();
      console.log('🗑️ Database cleared');
    } catch (error) {
      console.error('⚠️ Error clearing database:', error);
    }
  }

  getModels() {
    return {
      users: UserModel,
      posts: PostModel,
      blogs: BlogModel,
      comments: CommentModel,
      authMeta: AuthMetaModel,
      triggerAttempts: TriggerAttemptsModel,
    };
  }
}
