import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import { CodeConfirmation, CreateUserDto, UserDBModel } from '../types/types';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';

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

const userMethods = {
  async renewVerificationData({
    newExpirationDate,
    newCode,
  }: {
    newExpirationDate: string;
    newCode: string;
  }): Promise<void> {
    const user = this as unknown as UserDocument;

    user.emailConfirmation.expirationDate = newExpirationDate;
    user.emailConfirmation.confirmationCode = newCode;
    await user.save();
  },
  isUserVerifiedByEmail(): boolean {
    const user = this as unknown as UserDocument;

    return user.emailConfirmation.isConfirmed;
  },
  async initializeRecoverPassword(newExpirationDate: string, newCode: string): Promise<void> {
    const user = this as unknown as UserDocument;

    user.recoverPasswordEmailConfirmation = {
      expirationDate: newExpirationDate,
      confirmationCode: newCode,
      isConfirmed: false,
    };

    await user.save();
  },
  async changePassword(newPassword: string): Promise<void> {
    const user = this as unknown as UserDocument;
    user.password = newPassword;
    user.recoverPasswordEmailConfirmation = null;

    await user.save();
  },

  async confirmUserEmailById(): Promise<void> {
    const user = this as unknown as UserDocument;

    user.emailConfirmation.isConfirmed = true;
    await user.save();
  },
};

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
  async isEmailAndLoginUnique({
    email,
    login,
  }: {
    email: string;
    login: string;
  }): Promise<boolean> {
    const userList = await UserModel.findOne({ $or: [{ email }, { login }] });
    return !userList;
  },
};

type UserMethods = typeof userMethods;
type UserStatics = typeof userStatics;

export type UserDocument = HydratedDocument<UserDBModel, UserMethods>;

type UserModel = Model<UserDBModel, {}, UserMethods> & UserStatics;

userSchema.methods = userMethods;
userSchema.statics = userStatics;

export const UserModel = mongoose.model<UserDBModel, UserModel>('User', userSchema);
