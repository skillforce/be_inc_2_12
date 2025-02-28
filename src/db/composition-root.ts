import { AppConfig } from '../app_config';
import { MongoClient } from 'mongodb';
import { DataBase } from './mongo-db';

const appConfig = new AppConfig(process.env);
const mongoUrl = appConfig.MONGO_URL;
const mongoClient = new MongoClient(mongoUrl);
export const db = new DataBase(mongoClient, appConfig);
