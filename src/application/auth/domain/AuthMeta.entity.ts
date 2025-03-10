import mongoose, { Schema } from 'mongoose';
import { AuthMetaDBModel } from '../types/types';

const AuthMetaEntity = new Schema<AuthMetaDBModel>({
  iat: { type: String, required: true },
  user_id: { type: String, required: true },
  device_id: { type: String, required: true },
  exp: { type: String, required: true },
  device_name: { type: String, required: true },
  ip_address: { type: String, required: true },
});

export const AuthMetaModel = mongoose.model<AuthMetaDBModel>('AuthMeta', AuthMetaEntity);
