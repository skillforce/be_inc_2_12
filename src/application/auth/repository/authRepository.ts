import { SessionDto } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { AuthMetaModel } from './AuthMetaSchema';

@injectable()
export class AuthRepository {
  constructor() {}
  async addSession(sessionBody: SessionDto) {
    const result = await AuthMetaModel.create(sessionBody);

    if (!result._id) {
      return null;
    }
    return result._id;
  }
  async getSessionById(_id: ObjectId) {
    return AuthMetaModel.findOne({ _id });
  }
  async getSessionByDeviceId(device_id: string) {
    return AuthMetaModel.findOne({ device_id });
  }
  async updateRefreshTokenVersionByDeviceId({
    device_id,
    newVersionIat,
    newVersionExp,
  }: {
    device_id: string;
    newVersionIat: string;
    newVersionExp: string;
  }) {
    const result = await AuthMetaModel.updateOne(
      { device_id },
      { $set: { iat: newVersionIat, exp: newVersionExp } },
    );

    return result.matchedCount;
  }
  async removeSession(device_id: string, refreshTokenIatIso: string) {
    const result = await AuthMetaModel.deleteOne({ device_id, iat: refreshTokenIatIso });
    return result.deletedCount === 1;
  }
  async removeAllUserSessionsExceptCurrentOne(userId: string, device_id: string): Promise<boolean> {
    try {
      await AuthMetaModel.deleteMany({ user_id: userId, device_id: { $ne: device_id } });
      return true;
    } catch (e) {
      return false;
    }
  }
  async removeSessionByDeviceId(device_id: string): Promise<boolean> {
    const result = await AuthMetaModel.deleteOne({ device_id });
    return result.deletedCount === 1;
  }
}
