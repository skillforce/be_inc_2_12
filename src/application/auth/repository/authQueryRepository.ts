import { db } from '../../../db/mongo-db';
import { AuthMetaDBModel, SessionsViewModel } from '../types/types';

export const authQueryRepository = {
  async getAllSessions(): Promise<SessionsViewModel[]> {
    const allSessionsFromDb = await db.getCollections().authMetaCollection.find().toArray();
    return allSessionsFromDb.map(this.mapSessionToOutput);
  },

  mapSessionToOutput(session: AuthMetaDBModel): SessionsViewModel {
    return {
      ip: session.ip_address,
      title: session.device_name,
      lastActiveDate: session.iat,
      deviceId: session.device_id,
    };
  },
};
