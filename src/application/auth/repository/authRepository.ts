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
    console.log('newVersionIat', newVersionIat);
    console.log('newVersionExp', newVersionExp);
    const result = await db
      .getCollections()
      .authMetaCollection.updateOne(
        { device_id },
        { $set: { iat: newVersionIat, exp: newVersionExp } },
      );
    console.log('RESULT', result);
    return result.modifiedCount === 1;
  },
};
