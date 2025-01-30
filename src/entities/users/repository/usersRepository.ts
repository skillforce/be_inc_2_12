import { db } from '../../../db/mongo-db';
import { Filter, ObjectId, WithId } from 'mongodb';
import { AddUserRequestRequiredData, UserDBOutputType, UserDBType } from '../types/types';
import { LoginFilterSchema } from '../../../application/auth/types/types';

export const usersRepository = {
  async addUser(newUserData: AddUserRequestRequiredData): Promise<ObjectId> {
    const result = await db
      .getCollections()
      .usersCollection.insertOne(newUserData as WithId<AddUserRequestRequiredData>);
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
  async getUserById(_id: ObjectId): Promise<UserDBType | null> {
    const userById = await db.getCollections().usersCollection.findOne({ _id });

    if (!userById) {
      return null;
    }
    return userById;
  },
  async doesExistById(_id: ObjectId) {
    const countById = await db.getCollections().usersCollection.countDocuments({ _id });
    return countById === 1;
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBType> | null> {
    return db.getCollections().usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};
