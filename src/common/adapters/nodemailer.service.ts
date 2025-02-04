import { APP_CONFIG } from '../../app_config';
import nodemailer from 'nodemailer';

export const nodemailerService = {
  async sendEmail(email: string, emailLayout: string): Promise<boolean> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: APP_CONFIG.EMAIL,
        pass: APP_CONFIG.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: 'Tatarinov inc.',
      to: email,
      subject: 'Your code is here',
      html: emailLayout,
    });

    return !!info;
  },
};
