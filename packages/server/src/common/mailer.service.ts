import { Injectable, Logger } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly isDevelopment: boolean;
  private readonly fromEmail: string;
  private readonly clientBaseUrl: string;

  constructor() {
    // Set SendGrid API key if available
    if (process.env.SENDGRID_API_KEY) {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    }

    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.fromEmail = process.env.MAIL_FROM || 'noreply@kavira.app';
    this.clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Send a magic link email
   * 
   * @param to Recipient email
   * @param token Magic link token
   */
  async sendMagicLink(to: string, token: string): Promise<void> {
    const magicLinkUrl = `${this.clientBaseUrl}/auth/callback?token=${token}`;

    // In development mode, just log the magic link
    if (this.isDevelopment || !process.env.SENDGRID_API_KEY) {
      this.logger.log(`[Development] Magic link for ${to}: ${magicLinkUrl}`);
      return;
    }

    // Prepare email data
    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Your Kavira Magic Link',
      text: `Welcome to Kavira! Click this link to sign in: ${magicLinkUrl}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kavira!</h2>
          <p>Click the button below to sign in to your account. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Sign In to Kavira
            </a>
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #3B82F6;">${magicLinkUrl}</p>
          <p style="color: #6B7280; margin-top: 30px; font-size: 0.9em;">
            If you didn't request this email, you can safely ignore it.
          </p>
          <p style="color: #6B7280; font-size: 0.9em; margin-top: 20px;">
            Kavira - One world. Many voices.
          </p>
        </div>
      `,
    };

    try {
      await sendgrid.send(msg);
      this.logger.log(`Magic link email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send magic link email to ${to}`, error);
      throw new Error('Failed to send magic link email');
    }
  }
} 