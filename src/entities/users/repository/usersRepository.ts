import { ObjectId, WithId } from 'mongodb';
import { AddUserDto, UserDBModel } from '../types/types';
import { injectable } from 'inversify';
import { UserDocument, UserModel } from '../domain/User.entity';

@injectable()
export class UsersRepository {
  constructor() {}
  async saveUser(user: UserDocument) {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findOne({ _id: id });
  }
  async isFieldValueUnique(field: string, value: string): Promise<boolean> {
    const result = await UserModel.findOne({ [field]: value });
    return !result;
  }
  async deleteUser(_id: ObjectId): Promise<boolean> {
    const userToDelete = await UserModel.findOne({ _id });
    if (!userToDelete) {
      return false;
    }
    await userToDelete.deleteOne();
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
    const user = await UserModel.findById(_id);
    if (!user) {
      return false;
    }

    user.recoverPasswordEmailConfirmation = {
      expirationDate: newExpirationDate,
      confirmationCode: newCode,
      isConfirmed: false,
    };

    await user.save();

    return true;
  }

  async changePasswordByRecoveryCode(code: string, newPassword: string): Promise<boolean> {
    const user = await UserModel.findOne({
      'recoverPasswordEmailConfirmation.confirmationCode': code,
    });

    if (!user) return false;

    user.password = newPassword;
    user.recoverPasswordEmailConfirmation = null;

    await user.save();

    return true;
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
    const userToConfirm = await UserModel.findOne({ _id });
    if (!userToConfirm) return false;

    userToConfirm.emailConfirmation.isConfirmed = true;
    await userToConfirm.save();
    return true;
  }
  async doesExistById(_id: ObjectId) {
    const countById = await UserModel.countDocuments({ _id });
    return countById === 1;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
    return UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    }).exec();
  }
}
