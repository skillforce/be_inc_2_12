import { AppConfig } from '../app_config';
import { DataBase } from './mongo-db';

const appConfig = new AppConfig(process.env);
// const mongoUrl = appConfig.MONGO_URL;
export const db = new DataBase(appConfig);
