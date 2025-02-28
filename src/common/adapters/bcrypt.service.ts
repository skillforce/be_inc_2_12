import bcrypt from 'bcrypt';

export interface IBcrypt {
  hash(password: string | Buffer, saltOrRounds: string | number): Promise<string>;
  hashSync(password: string | Buffer, saltOrRounds: string | number): string;
  compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  compareSync(data: string | Buffer, encrypted: string): boolean;
  genSalt(rounds?: number): Promise<string>;
  genSaltSync(rounds?: number): string;
}
class BcryptService {
  constructor(protected bcrypt: IBcrypt) {}
  async generateHash(password: string) {
    try {
      const saltRounds = 10;
      return await this.bcrypt.hash(password, saltRounds);
    } catch (error: unknown) {
      throw new Error(`Error hashing password: ${error}`);
    }
  }

  async checkPassword(password: string, hash: string) {
    try {
      return await this.bcrypt.compare(password, hash);
    } catch (error: unknown) {
      throw new Error(`Error comparing passwords: ${error}`);
    }
  }
}

export const bcryptService = new BcryptService(bcrypt);
