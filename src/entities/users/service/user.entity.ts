import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

export class User {
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  };

  constructor({
    login,
    email,
    hash,
    isConfirmed = false,
  }: {
    login: string;
    email: string;
    hash: string;
    isConfirmed?: boolean;
  }) {
    this.login = login;
    this.email = email;
    this.password = hash;
    this.createdAt = dayjs().toISOString();
    this.emailConfirmation = {
      expirationDate: dayjs().add(30, 'minute').toISOString(),
      confirmationCode: randomUUID(),
      isConfirmed,
    };
  }
}
