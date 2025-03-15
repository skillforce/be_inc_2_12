import { ObjectId } from 'mongodb';
import { SortQueryFieldsType } from '../../../common/types/sortQueryFieldsType';

export interface UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export interface UserAuthViewModel {
  email: string;
  login: string;
  userId: string;
}

export interface CodeConfirmation {
  confirmationCode: string | null;
  expirationDate: string | null;
  isConfirmed: boolean;
}

export interface UserDBModel {
  _id: ObjectId;
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation: CodeConfirmation;
  recoverPasswordEmailConfirmation: CodeConfirmation | null;
}

export interface CreateUserDto {
  login: string;
  email: string;
  password: string;
  isConfirmed?: boolean;
}

export enum UsersOutputMapEnum {
  VIEW = 'VIEW',
  AUTH = 'AUTH',
}

export interface GetPaginatedUsersQueryInterface extends SortQueryFieldsType {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
