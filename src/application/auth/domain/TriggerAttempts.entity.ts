import mongoose, { Schema } from 'mongoose';
import { TriggerAttemptsCollectionDBModel } from '../../../common/types/types';

const TriggerAttemptsEntity = new Schema<TriggerAttemptsCollectionDBModel>({
  ip: { type: String, required: true },
  route: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
});

export const TriggerAttemptsModel = mongoose.model<TriggerAttemptsCollectionDBModel>(
  'TriggerAttempt',
  TriggerAttemptsEntity,
);
