import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import { CodeConfirmation, CreateUserDto, UserDBModel } from '../types/types';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';

const CodeConfirmationSchema = new Schema<CodeConfirmation>({
  confirmationCode: { type: String, default: null },
  expirationDate: { type: String, default: null },
  isConfirmed: { type: Boolean, required: true },
});

const userSchema = new Schema<UserDBModel>({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true, default: dayjs().toISOString() },
  emailConfirmation: { type: CodeConfirmationSchema, default: null },
  recoverPasswordEmailConfirmation: { type: CodeConfirmationSchema, default: null },
});

const userMethods = {};

const userStatics = {
  createUser({ password, login, email, isConfirmed = false }: CreateUserDto) {
    const newUser = new UserModel() as unknown as UserDocument;

    newUser.login = login;
    newUser.email = email;
    newUser.password = password;
    if (isConfirmed) {
      newUser.emailConfirmation = {
        expirationDate: null,
        confirmationCode: null,
        isConfirmed,
      };
    } else {
      newUser.emailConfirmation = {
        expirationDate: dayjs().add(30, 'minute').toISOString(),
        confirmationCode: randomUUID(),
        isConfirmed: false,
      };
    }

    return newUser;
  },
};

type UserMethods = typeof userMethods;
type UserStatics = typeof userStatics;

export type UserDocument = HydratedDocument<UserDBModel, UserMethods>;

type UserModel = Model<UserDBModel, {}, UserMethods> & UserStatics;

userSchema.methods = userMethods;
userSchema.statics = userStatics;

export const UserModel = mongoose.model<UserDBModel, UserModel>('User', userSchema);
