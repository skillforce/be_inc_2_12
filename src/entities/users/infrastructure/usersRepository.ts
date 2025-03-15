import { injectable } from 'inversify';
import { UserDocument, UserModel } from '../domain/User.entity';

@injectable()
export class UsersRepository {
  constructor() {}
  async saveUser(user: UserDocument) {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findOne({ _id: id });
  }
  async deleteUser(user: UserDocument): Promise<void> {
    await user.deleteOne();
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }
  async findUserByRegistrationCode(code: string): Promise<UserDocument | null> {
    const userByCode = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
  async findByRecoveryCode(code: string): Promise<UserDocument | null> {
    const userByCode = await UserModel.findOne({
      'recoverPasswordEmailConfirmation.confirmationCode': code,
    });
    if (!userByCode) {
      return null;
    }
    return userByCode;
  }
}
