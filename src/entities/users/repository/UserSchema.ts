import mongoose, { Schema } from 'mongoose';
import { CodeConfirmation, UserDBModel } from '../types/types';

const CodeConfirmationSchema = new Schema<CodeConfirmation>({
  confirmationCode: { type: String, required: true },
  expirationDate: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true },
});

const UserSchema = new Schema<UserDBModel>({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true, default: Date.now().toString() },
  emailConfirmation: { type: CodeConfirmationSchema, required: true },
  recoverPasswordEmailConfirmation: { type: CodeConfirmationSchema, default: null },
});

export const UserModel = mongoose.model<UserDBModel>('User', UserSchema);
