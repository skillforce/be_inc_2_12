import { emailTemplate } from './emailTemplate';

export const authEmails = {
  registrationEmail(code: string) {
    const emailBody = `<h1>Registration Successful!</h1>
                <p>Dear User,</p>
                <p>Thank you for registering! Your account has been successfully created. You can now log in and enjoy our services.</p>
                <a href="https://somesite.com/confirm-email?code=${code}" class="button">Confirm registration</a>
                <p class="footer">If you did not create this account, please ignore this email.</p>
`;

    return emailTemplate(emailBody);
  },
  passwordRecoveryEmail(code: string) {
    const emailBody = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;

    return emailTemplate(emailBody);
  },
};
