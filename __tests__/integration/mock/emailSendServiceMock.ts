import { nodemailerService } from '../../../src/common/adapters/nodemailer.service';

export const emailServiceMock: typeof nodemailerService = {
  async sendEmail(email: string, code: string): Promise<boolean> {
    return true;
  },
};
