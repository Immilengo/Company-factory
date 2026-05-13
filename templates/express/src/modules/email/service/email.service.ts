import nodemailer from 'nodemailer';
import { env } from '@config/env';
import { SendEmailInput } from '../interfaces/email.interface';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: {
    user: env.MAIL_USERNAME,
    pass: env.MAIL_PASSWORD
  }
});

export class EmailService {
  async send(data: SendEmailInput): Promise<void> {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html
    });
  }
}
