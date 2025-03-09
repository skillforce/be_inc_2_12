import { DataBase } from '../../../db/mongo-db';
import { ObjectId, WithId } from 'mongodb';
import { AddUserDto, UserDBModel, UserDocument } from '../types/types';
import { inject, injectable } from 'inversify';
import { UserModel } from './UserSchema';

@injectable()
export class UsersRepository {
  constructor() {}
  async addUser(newUserData: AddUserDto): Promise<ObjectId | null> {
    const newUser = await UserModel.create(newUserData);
    if (!newUser._id) {
      return null;
    }
    return newUser._id;
  }
  async isFieldValueUnique(field: string, value: string): Promise<boolean> {
    const result = await UserModel.findOne({ [field]: value });
    return !result;
  }
  async deleteUser(_id: ObjectId): Promise<boolean> {
    const userToDelete = UserModel.findOne({ _id });
    if (!userToDelete) {
      return false;
    }
    userToDelete.deleteOne();
    return true;
  }
  async getUserById(_id: ObjectId): Promise<UserDBModel | null> {
    const userById = await UserModel.findOne({ _id });

    if (!userById) {
      return null;
    }
    return userById;
  }
  async renewVerificationData(
    _id: ObjectId,
    newExpirationDate: string,
    newCode: string,
  ): Promise<boolean> {
    const userToUpdate = await UserModel.findOne({ _id });
    if (!userToUpdate) {
      return false;
    }

    userToUpdate.emailConfirmation.expirationDate = newExpirationDate;
    userToUpdate.emailConfirmation.confirmationCode = newCode;
    await userToUpdate.save();
    return true;
  }
  async initializeRecoverPassword(
    _id: ObjectId,
    newExpirationDate: string,
    newCode: string,
  ): Promise<boolean> {
    const userToUpdate = await UserModel.findOne({ _id });
    if (!userToUpdate) {
      return false;
    }
    const updateResult = await UserModel.updateOne(
      { _id },
      {
        $set: {
          recoverPasswordEmailConfirmation: {
            expirationDate: newExpirationDate,
            confirmationCode: newCode,
            isConfirmed: false,
          },
        },
      },
    );

    return updateResult.modifiedCount === 1;
  }

  async changePasswordByRecoveryCode(code: string, newPassword: string): Promise<boolean> {
    const updateResult = await UserModel.updateOne(
      { 'recoverPasswordEmailConfirmation.confirmationCode': code },
      {
        $set: {
          password: newPassword,
          recoverPasswordEmailConfirmation: null,
        },
      },
    );
    return updateResult.modifiedCount === 1;
  }
  async getUserByRegistrationCode(code: string): Promise<UserDBModel | null> {
    const userByCode = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
  async findByRecoveryCode(code: string): Promise<UserDBModel | null> {
    const userByCode = await UserModel.findOne({
      'recoverPasswordEmailConfirmation.confirmationCode': code,
    });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
  async confirmUserEmailById(_id: ObjectId): Promise<boolean> {
    const updateResult = await UserModel.updateOne(
      { _id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );

    return updateResult.matchedCount === 1;
  }
  async doesExistById(_id: ObjectId) {
    const countById = await UserModel.countDocuments({ _id });
    return countById === 1;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
    return UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }
}
