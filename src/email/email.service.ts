// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendConfirmationEmail(to: string, token: string): Promise<void> {
    const confirmationUrl = `${process.env.APP_URL}/auth/confirm?token=${token}`;

    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Confirm your email',
      html: `
        <h3>Welcome!</h3>
        <p>Please confirm your email by clicking the link below:</p>
        <a href="${confirmationUrl}">${confirmationUrl}</a>
      `,
    });
  }
}
