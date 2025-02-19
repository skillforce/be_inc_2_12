export type RequireOnlyOne<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

export interface TriggerAttemptsCollectionDBModel {
  _id: string;
  ip: string;
  route: string;
  timestamp: Date;
}
