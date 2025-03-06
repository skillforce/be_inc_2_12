import { DataBase } from '../../../db/mongo-db';
import { AuthMetaDBModel, SessionsViewModel } from '../types/types';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthQueryRepository {
  constructor(@inject(DataBase) protected database: DataBase) {}
  async getAllSessionsForCurrentUser({ userId }: { userId: string }): Promise<SessionsViewModel[]> {
    const allSessionsFromDb = await this.database
      .getCollections()
      .authMetaCollection.find({ user_id: userId })
      .toArray();
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
