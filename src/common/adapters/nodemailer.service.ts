import { APP_CONFIG } from '../../app_config';
import nodemailer from 'nodemailer';

export const nodemailerService = {
  async sendEmail(email: string, emailLayout: string): Promise<boolean> {
    let transporter = nodemailer.createTransport({
      service: 'Mail.ru',
      port: 587,
      auth: {
        user: APP_CONFIG.EMAIL,
        pass: APP_CONFIG.EMAIL_PASS,
      },
    });

    console.log(transporter);

    try {
      const info = await transporter.sendMail({
        from: `Denis: <${APP_CONFIG.EMAIL}>`,
        to: email,
        subject: '👋 Hello from Node.js 🚀',
        html: emailLayout,
      });

      console.log('Email sent:', info.messageId);
      return !!info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};
