import { APP_CONFIG } from '../../app_config';
import nodemailer from 'nodemailer';

class MailService {
  async sendEmail(email: string, emailLayout: string): Promise<boolean> {
    let transporter = nodemailer.createTransport({
      service: APP_CONFIG.EMAIL_SERVICE,
      port: 465,
      secure: true,
      auth: {
        user: APP_CONFIG.EMAIL,
        pass: APP_CONFIG.EMAIL_PASS,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: 'Incubator_HW <' + APP_CONFIG.EMAIL + '>',
        to: email,
        subject: '👋 Hello there!',
        html: emailLayout,
      });

      return !!info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export const mailService = new MailService();
