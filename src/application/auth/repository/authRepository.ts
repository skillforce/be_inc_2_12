import { SessionDto } from '../types/types';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { AuthMetaModel } from '../domain/AuthMeta.entity';

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
  }): Promise<boolean> {
    const session = await AuthMetaModel.findOne({ device_id });
    if (!session) {
      return false;
    }

    session.iat = newVersionIat;
    session.exp = newVersionExp;
    await session.save();

    return true;
  }
  async removeSession(device_id: string, refreshTokenIatIso: string): Promise<boolean> {
    const sessionToRemove = await AuthMetaModel.findOne({ device_id, iat: refreshTokenIatIso });
    if (!sessionToRemove) {
      return false;
    }
    await sessionToRemove.deleteOne();
    return true;
  }
  async removeAllUserSessionsExceptCurrentOne(userId: string, device_id: string): Promise<boolean> {
    await AuthMetaModel.deleteMany({
      user_id: userId,
      device_id: { $ne: device_id },
    });
    return true;
  }
  async removeSessionByDeviceId(device_id: string): Promise<boolean> {
    const sessionToDelete = await AuthMetaModel.findOne({ device_id });
    if (!sessionToDelete) {
      return false;
    }
    await sessionToDelete.deleteOne();
    return true;
  }
}
