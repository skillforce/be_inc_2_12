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

interface CodeConfirmation {
  confirmationCode: string;
  expirationDate: string;
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

export interface AddUserDto {
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation: CodeConfirmation;
  recoverPasswordEmailConfirmation: CodeConfirmation | null;
}

export interface AddUserRequiredInputData {
  login: string;
  email: string;
  password: string;
}

export enum UsersOutputMapEnum {
  VIEW = 'VIEW',
  AUTH = 'AUTH',
}

export interface GetPaginatedUsersQueryInterface extends SortQueryFieldsType {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
