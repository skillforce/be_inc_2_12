import { ObjectId } from 'mongodb';

export interface AuthLoginDto {
  loginOrEmail: string;
  password: string;
  ip_address: string;
  device_name: string;
}
export interface RegisterUserDto {
  login: string;
  password: string;
  email: string;
}

export interface AuthMetaDBModel {
  _id: ObjectId;
  iat: string;
  user_id: string;
  device_id: string;
  exp: string;
  device_name: string;
  ip_address: string;
}

export interface SessionsViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export interface SessionDto {
  iat: string;
  user_id: string;
  device_id: string;
  exp: string;
  device_name: string;
  ip_address: string;
}
