import { DataBase } from '../../../db/mongo-db';
import { AuthMetaDBModel, SessionsViewModel } from '../types/types';
import { inject, injectable } from 'inversify';
import { AuthMetaModel } from './AuthMetaSchema';

@injectable()
export class AuthQueryRepository {
  constructor() {}
  async getAllSessionsForCurrentUser({ userId }: { userId: string }): Promise<SessionsViewModel[]> {
    const allSessionsFromDb = await AuthMetaModel.find({ user_id: userId }).lean();
    return allSessionsFromDb.map(this.mapSessionToOutput);
  }

  mapSessionToOutput(session: AuthMetaDBModel): SessionsViewModel {
    return {
      ip: session.ip_address,
      title: session.device_name,
      lastActiveDate: session.iat,
      deviceId: session.device_id,
    };
  }
}
