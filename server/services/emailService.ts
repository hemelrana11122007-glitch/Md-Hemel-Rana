import nodemailer, { Transporter } from 'nodemailer';
import { APP_URL } from '../config';

export interface DevEmail {
  id: string;
  to: string;
  subject: string;
  previewUrl: string;
  token?: string;
  type: 'verification' | 'password_reset';
  sentAt: string;
}

// In-memory development inbox store so verification and password resets can be easily tested without requiring third-party SMTP accounts
const devEmails: DevEmail[] = [];

// Nodemailer transport setup
let transporter: Transporter | null = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const emailService = {
  /**
   * Sends Account Email Verification with token
   */
  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const verifyUrl = `${APP_URL}?verify_token=${token}`;
    const subject = 'Verify Your Email Address - AR Market BD';
    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #008080; padding: 16px; border-radius: 8px; text-align: center; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px;">AR Market BD</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 18px;">Welcome, ${name}!</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Thank you for creating an account on AR Market BD. Please verify your email address to unlock full multi-vendor buyer and wholesale trading features.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${verifyUrl}" style="background-color: #008080; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This link will expire in 24 hours. If you did not create this account, you can safely ignore this email.</p>
        <p style="color: #94a3b8; font-size: 11px; word-break: break-all;">Verification URL: ${verifyUrl}</p>
      </div>
    `;

    devEmails.unshift({
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      to: email,
      subject,
      previewUrl: verifyUrl,
      token,
      type: 'verification',
      sentAt: new Date().toISOString(),
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"AR Market BD Security" <no-reply@armarketbd.com>',
          to: email,
          subject,
          html,
        });
      } catch (err) {
        console.error('Failed to send SMTP email, stored in dev mailbox:', err);
      }
    }
  },

  /**
   * Sends Password Reset Email with secure short-lived token
   */
  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const resetUrl = `${APP_URL}?reset_token=${token}`;
    const subject = 'Reset Your Password - AR Market BD';
    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #008080; padding: 16px; border-radius: 8px; text-align: center; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px;">AR Market BD Security</h1>
        </div>
        <h2 style="color: #1e293b; font-size: 18px;">Hello ${name},</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          We received a request to reset your AR Market BD account password. Click the secure button below to choose a new password.
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #008080; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This link will expire in 1 hour. If you did not request this, please ensure your account is protected.</p>
        <p style="color: #94a3b8; font-size: 11px; word-break: break-all;">Reset URL: ${resetUrl}</p>
      </div>
    `;

    devEmails.unshift({
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      to: email,
      subject,
      previewUrl: resetUrl,
      token,
      type: 'password_reset',
      sentAt: new Date().toISOString(),
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"AR Market BD Security" <no-reply@armarketbd.com>',
          to: email,
          subject,
          html,
        });
      } catch (err) {
        console.error('Failed to send SMTP email, stored in dev mailbox:', err);
      }
    }
  },

  getDevEmails(): DevEmail[] {
    return devEmails.slice(0, 20);
  },

  clearDevEmails(): void {
    devEmails.length = 0;
  },
};
