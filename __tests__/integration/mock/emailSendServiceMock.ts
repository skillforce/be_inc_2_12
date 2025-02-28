import { mailService } from '../../../src/common/adapters/mail.service';

export const emailServiceMock: typeof mailService = {
  async sendEmail(email: string, code: string): Promise<boolean> {
    return true;
  },
};
