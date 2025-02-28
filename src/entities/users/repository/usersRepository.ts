import { DataBase } from '../../../db/mongo-db';
import { ObjectId, WithId } from 'mongodb';
import { AddUserDto, UserDBModel } from '../types/types';

export class UsersRepository {
  constructor(protected database: DataBase) {}
  async addUser(newUserData: AddUserDto): Promise<ObjectId> {
    const result = await this.database
      .getCollections()
      .usersCollection.insertOne(newUserData as WithId<AddUserDto>);
    return result.insertedId;
  }
  async isFieldValueUnique(field: string, value: string): Promise<boolean> {
    const result = await this.database.getCollections().usersCollection.findOne({ [field]: value });
    return !result;
  }
  async deleteUser(_id: ObjectId): Promise<boolean> {
    const result = await this.database.getCollections().usersCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  }
  async getUserById(_id: ObjectId): Promise<UserDBModel | null> {
    const userById = await this.database.getCollections().usersCollection.findOne({ _id });

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
    const updateResult = await this.database.getCollections().usersCollection.updateOne(
      { _id },
      {
        $set: {
          'emailConfirmation.expirationDate': newExpirationDate,
          'emailConfirmation.confirmationCode': newCode,
        },
      },
    );

    return updateResult.modifiedCount === 1;
  }
  async initializeRecoverPassword(
    _id: ObjectId,
    newExpirationDate: string,
    newCode: string,
  ): Promise<boolean> {
    const updateResult = await this.database.getCollections().usersCollection.updateOne(
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
    const updateResult = await this.database.getCollections().usersCollection.updateOne(
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
    const userByCode = await this.database
      .getCollections()
      .usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
  async findByRecoveryCode(code: string): Promise<UserDBModel | null> {
    const userByCode = await this.database
      .getCollections()
      .usersCollection.findOne({ 'recoverPasswordEmailConfirmation.confirmationCode': code });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
  async confirmUserEmailById(_id: ObjectId): Promise<boolean> {
    const updateResult = await this.database
      .getCollections()
      .usersCollection.updateOne({ _id }, { $set: { 'emailConfirmation.isConfirmed': true } });

    return updateResult.matchedCount === 1;
  }
  async doesExistById(_id: ObjectId) {
    const countById = await this.database.getCollections().usersCollection.countDocuments({ _id });
    return countById === 1;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
    return this.database.getCollections().usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }
}
