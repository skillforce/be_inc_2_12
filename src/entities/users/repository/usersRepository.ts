import { db } from '../../../db/mongo-db';
import { Filter, ObjectId, WithId } from 'mongodb';
import { AddUserDto, UserViewModel, UserDBModel } from '../types/types';
import { LoginFilterSchema } from '../../../application/auth/types/types';

export const usersRepository = {
  async addUser(newUserData: AddUserDto): Promise<ObjectId> {
    const result = await db
      .getCollections()
      .usersCollection.insertOne(newUserData as WithId<AddUserDto>);
    return result.insertedId;
  },
  async isFieldValueUnique(field: string, value: string): Promise<boolean> {
    const result = await db.getCollections().usersCollection.findOne({ [field]: value });
    return !result;
  },
  async deleteUser(_id: ObjectId): Promise<boolean> {
    const result = await db.getCollections().usersCollection.deleteOne({ _id });
    return result.deletedCount === 1;
  },
  async getUserById(_id: ObjectId): Promise<UserDBModel | null> {
    const userById = await db.getCollections().usersCollection.findOne({ _id });

    if (!userById) {
      return null;
    }
    return userById;
  },
  async renewVerificationData(
    _id: ObjectId,
    newExpirationDate: string,
    newCode: string,
  ): Promise<boolean> {
    const updateResult = await db.getCollections().usersCollection.updateOne(
      { _id },
      {
        $set: {
          'emailConfirmation.expirationDate': newExpirationDate,
          'emailConfirmation.confirmationCode': newCode,
        },
      },
    );

    return updateResult.modifiedCount === 1;
  },
  async getUserByRegistrationCode(code: string): Promise<UserDBModel | null> {
    const userByCode = await db
      .getCollections()
      .usersCollection.findOne({ 'emailConfirmation.confirmationCode': code });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  },
  async confirmUserEmailById(_id: ObjectId): Promise<boolean> {
    const updateResult = await db
      .getCollections()
      .usersCollection.updateOne({ _id }, { $set: { 'emailConfirmation.isConfirmed': true } });

    return updateResult.matchedCount === 1;
  },
  async doesExistById(_id: ObjectId) {
    const countById = await db.getCollections().usersCollection.countDocuments({ _id });
    return countById === 1;
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
    return db.getCollections().usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};
