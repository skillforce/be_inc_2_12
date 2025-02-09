import { db } from '../../../db/mongo-db';
import { RefreshTokenDBModel } from '../types/types';

export const authRepository = {
  async isTokenExist(token: string): Promise<boolean> {
    const result = await db.getCollections().tokenBlackListCollection.findOne({ token });
    return !!result;
  },
  async addTokenToBlackList(token: string): Promise<boolean> {
    const result = await db
      .getCollections()
      .tokenBlackListCollection.insertOne({ token } as RefreshTokenDBModel);
    return !!result.insertedId;
  },
};
