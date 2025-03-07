import { AppConfig } from '../app_config';
import { injectable } from 'inversify';
import 'reflect-metadata';
import * as mongoose from 'mongoose';

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
}
