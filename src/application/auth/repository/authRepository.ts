import { db } from '../../../db/mongo-db';
import { SessionDto } from '../types/types';
import { ObjectId, WithId } from 'mongodb';

export const authRepository = {
  async addSession(sessionBody: SessionDto) {
    const result = await db
      .getCollections()
      .authMetaCollection.insertOne(sessionBody as WithId<SessionDto>);

    return result.insertedId;
  },
  async getSessionById(_id: ObjectId) {
    return await db.getCollections().authMetaCollection.findOne({ _id });
  },
  async getSessionByDeviceId(device_id: string) {
    return await db.getCollections().authMetaCollection.findOne({ device_id });
  },
  async updateRefreshTokenVersionByDeviceId(
    device_id: string,
    newVersionIat: string,
    newVersionExp: string,
  ) {
    const result = await db
      .getCollections()
      .authMetaCollection.updateOne(
        { device_id },
        { $set: { iat: newVersionIat, exp: newVersionExp } },
      );

    return result.modifiedCount === 1;
  },
  async removeSession(device_id: string, refreshTokenIatIso: string) {
    const result = await db
      .getCollections()
      .authMetaCollection.deleteOne({ device_id, iat: refreshTokenIatIso });
    return result.deletedCount === 1;
  },
  async removeAllUserSessionsExceptCurrentOne(userId: string, device_id: string): Promise<boolean> {
    try {
      await db
        .getCollections()
        .authMetaCollection.deleteMany({ user_id: userId, device_id: { $ne: device_id } });
      return true;
    } catch (e) {
      return false;
    }
  },
  async removeSessionByDeviceId(device_id: string): Promise<boolean> {
    const result = await db.getCollections().authMetaCollection.deleteOne({ device_id });
    return result.deletedCount === 1;
  },
};
