import nodemailer, { Transporter } from 'nodemailer';
import { EmailTransportModel } from '../schema/emailTransport.js';
import { ScheduledEmailModel } from '../schema/scheduledEmail.js';
import { FastifyBaseLogger } from 'fastify';
import { generateEmailTemplate, generatePlainTextEmail } from '../util/emailTemplate.js';

interface MailOptions {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  recipientCount?: number;
  error?: string;
  limitInfo?: {
    currentCount: number;
    dailyLimit: number;
    remaining: number;
    percentageUsed: number;
    requestedCount?: number;
  };
  code?: string;
}

interface EmailUsageStats {
  currentCount: number;
  dailyLimit: number;
  remaining: number;
  percentageUsed: number;
}

class EmailService {
  private transporter: Transporter | null = null;
  private dailyLimit: number;
  private googleEmail: string;
  private googleAppPassword: string;
  private logger?: FastifyBaseLogger;

  constructor(logger?: FastifyBaseLogger) {
    this.logger = logger;
    this.googleEmail = process.env.GOOGLE_SERVICE_EMAIL ?? '';
    this.googleAppPassword = process.env.GOOGLE_APP_PASSWORD ?? '';
    this.dailyLimit = this.getDailyLimit();
  }

  /**
   * Get daily sending limit based on Gmail account type
   * Personal: 400 recipients per 24 hours (reduced from 500 for safety)
   * Workspace: 2,000 recipients per 24 hours
   */
  private getDailyLimit(): number {
    const accountType = (process.env.GOOGLE_ACCOUNT_TYPE || 'personal').toLowerCase();
    return accountType === 'personal' ? 400 : 2000;
  }

  /**
   * Initialize the nodemailer transporter
   */
  private async initTransporter(): Promise<Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.googleEmail,
          pass: this.googleAppPassword
        }
      });
    }
    return this.transporter;
  }

  /**
   * Count total recipients from email options
   * Counts: to, cc, bcc addresses (each address counts as 1 recipient)
   * @param mailOptions - Nodemailer mail options
   * @returns Total recipient count
   */
  private countRecipients(mailOptions: MailOptions): number {
    let count = 0;

    // Count 'to' recipients
    if (mailOptions.to) {
      const toArray = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
      count += toArray.length;
    }

    // Count 'cc' recipients
    if (mailOptions.cc) {
      const ccArray = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
      count += ccArray.length;
    }

    // Count 'bcc' recipients
    if (mailOptions.bcc) {
      const bccArray = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
      count += bccArray.length;
    }

    return count || 1; // At least 1 recipient if none specified
  }

  /**
   * Check if we can send emails with the given recipient count
   * @param recipientCount - Number of recipients for this email
   * @returns { canSend: boolean, currentCount: number, remaining: number, dailyLimit: number, percentageUsed: number, requestedCount: number }
   */
  async checkLimit(recipientCount: number): Promise<{
    canSend: boolean;
    currentCount: number;
    remaining: number;
    dailyLimit: number;
    percentageUsed: number;
    requestedCount: number;
  }> {
    const canSend = await EmailTransportModel.canSendEmails(recipientCount, this.dailyLimit);
    const stats = await EmailTransportModel.getUsageStats(this.dailyLimit);

    return {
      canSend,
      ...stats,
      requestedCount: recipientCount
    };
  }

  /**
   * Get current email usage statistics
   * @returns Usage stats object
   */
  async getUsageStats(): Promise<EmailUsageStats> {
    return await EmailTransportModel.getUsageStats(this.dailyLimit);
  }

  /**
   * Get the start of the next day (midnight) for scheduling emails
   * This ensures emails hit by the limit are sent at the start of the next day
   */
  private getNextDayStart(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    return tomorrow;
  }

  /**
   * Schedule an email to be sent later via database
   * @param mailOptions - Email options
   * @param emailType - Type of email
   * @param scheduledTime - Date when to send the email
   */
  async scheduleEmail(mailOptions: MailOptions, emailType: string, scheduledTime: Date): Promise<void> {
    try {
      await ScheduledEmailModel.create({
        mailOptions,
        emailType,
        scheduledTime,
        status: 'pending'
      });

      this.logger?.info({
        msg: 'Email scheduled for later delivery',
        scheduledTime,
        emailType
      });
    } catch (error: any) {
      this.logger?.error('Error scheduling email', error);
    }
  }

  /**
   * Wrap content in DKMedia email template if not already wrapped
   * @param html - HTML content to wrap
   * @param subject - Email subject (used as heading if no heading detected)
   * @returns Wrapped HTML with template
   */
  private wrapInTemplate(html: string, subject?: string): string {
    // Check if content is already wrapped in our template (contains DKMedia header)
    if ((html.includes('DKMedia') || html.includes('DKMedia305')) && html.includes('<!DOCTYPE html>')) {
      return html;
    }

    // Extract heading if HTML starts with <h1> or <h2>
    const headingMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
    let heading = headingMatch ? headingMatch[1].replace(/<[^>]*>/g, '') : undefined;
    
    // Remove heading from content if found
    let content = html;
    if (headingMatch) {
      content = html.replace(headingMatch[0], '').trim();
    }

    // Use subject as heading if no heading was found
    if (!heading && subject) {
      heading = subject;
    }

    return generateEmailTemplate({
      heading,
      content
    });
  }

  /**
   * Send an email with Gmail limit enforcement
   * @param mailOptions - Nodemailer mail options (to, cc, bcc, subject, text, html, etc.)
   * @param emailType - Type of email (e.g., 'booking', 'notification', 'general')
   * @returns { success: boolean, messageId?: string, error?: string, limitInfo?: Object }
   */
  async sendEmail(mailOptions: MailOptions, emailType: string = 'general'): Promise<SendEmailResult> {
    try {
      // Initialize transporter if not already done
      await this.initTransporter();

      // Wrap HTML content in template if provided
      if (mailOptions.html) {
        mailOptions.html = this.wrapInTemplate(mailOptions.html, mailOptions.subject);
      }

      // Generate plain text version if not provided (for accessibility and email clients)
      if (!mailOptions.text && mailOptions.html) {
        // Extract text from HTML
        const textContent = mailOptions.html
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        mailOptions.text = textContent || mailOptions.subject || 'Email from DKMedia';
      }

      // Count recipients for this email
      const recipientCount = this.countRecipients(mailOptions);

      // Check if we can send within the limit
      const limitCheck = await this.checkLimit(recipientCount);

      if (!limitCheck.canSend) {
        // Schedule email for next day (start of day) if limit exceeded
        const nextDay = this.getNextDayStart();
        await this.scheduleEmail(mailOptions, emailType, nextDay);

        const errorMessage = `Email sending limit exceeded. Current usage: ${limitCheck.currentCount}/${this.dailyLimit}. Requested: ${recipientCount}. Remaining: ${limitCheck.remaining}. Email scheduled for next day.`;
        
        return {
          success: false,
          error: errorMessage,
          limitInfo: limitCheck,
          code: 'LIMIT_EXCEEDED'
        };
      }

      // Ensure 'from' is set
      if (!mailOptions.from) {
        mailOptions.from = this.googleEmail;
      }

      // Send the email
      const info = await this.transporter!.sendMail(mailOptions);

      // Record the email send in the database
      await EmailTransportModel.recordEmailSend(recipientCount, emailType);

      // Get updated stats
      const updatedStats = await EmailTransportModel.getUsageStats(this.dailyLimit);

      this.logger?.info({
        msg: 'Email sent successfully',
        messageId: info.messageId,
        recipientCount,
        emailType,
        limitInfo: updatedStats
      });

      return {
        success: true,
        messageId: info.messageId,
        recipientCount,
        limitInfo: updatedStats
      };
    } catch (error: any) {
      // Handle SMTP errors (like 454 4.7.0 "Too many recipients")
      if (error.code === 'EENVELOPE' || error.responseCode === 454) {
        this.logger?.error('SMTP limit exceeded error', error);
        
        // Schedule for next day (start of day)
        const nextDay = this.getNextDayStart();
        await this.scheduleEmail(mailOptions, emailType, nextDay);

        return {
          success: false,
          error: `Gmail SMTP error: Too many recipients. ${error.message}`,
          code: 'SMTP_LIMIT_EXCEEDED'
        };
      }

      // Handle authentication errors
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        this.logger?.error('Email authentication error', error);
        return {
          success: false,
          error: 'Email service authentication failed. Please check email configuration.',
          code: 'AUTH_ERROR'
        };
      }

      // Handle connection errors
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        this.logger?.error('Email service connection error', error);
        
        // Schedule for retry later
        const retryTime = new Date(Date.now() + (60 * 60 * 1000)); // Retry in 1 hour
        await this.scheduleEmail(mailOptions, emailType, retryTime);

        return {
          success: false,
          error: 'Failed to connect to email service. Email scheduled for retry.',
          code: 'CONNECTION_ERROR'
        };
      }

      // Log and return generic error
      this.logger?.error('Email send error', error);

      return {
        success: false,
        error: error.message || 'Failed to send email',
        code: 'SEND_ERROR'
      };
    }
  }

  /**
   * Send bulk emails to multiple recipients, respecting daily limits
   * Sends emails in batches if needed, scheduling excess for next day
   * @param recipients - Array of recipient email addresses
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Plain text content (optional)
   * @param emailType - Type of email (default: 'newsletter')
   * @returns { success: boolean, sent: number, scheduled: number, total: number, errors?: string[] }
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
    text?: string,
    emailType: string = 'newsletter'
  ): Promise<{
    success: boolean;
    sent: number;
    scheduled: number;
    total: number;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let sent = 0;
    let scheduled = 0;
    const total = recipients.length;

    try {
      // Get current usage stats
      const usageStats = await this.getUsageStats();
      const remaining = usageStats.remaining;

      if (remaining <= 0) {
        // No remaining emails today, schedule all for next day
        const nextDay = this.getNextDayStart();
        for (const recipient of recipients) {
          try {
            const mailOptions: MailOptions = {
              to: recipient,
              subject,
              html,
              text
            };
            
            // Set from field to info@dkmedia305.com for newsletters
            if (emailType === 'newsletter') {
              mailOptions.from = 'info@dkmedia305.com';
            }
            
            await this.scheduleEmail(
              mailOptions,
              emailType,
              nextDay
            );
            scheduled++;
          } catch (error: any) {
            errors.push(`Failed to schedule email to ${recipient}: ${error.message}`);
          }
        }
        return { success: scheduled > 0, sent: 0, scheduled, total, errors: errors.length > 0 ? errors : undefined };
      }

      // Determine how many we can send today
      const canSendToday = Math.min(remaining, recipients.length);
      const recipientsToSend = recipients.slice(0, canSendToday);
      const recipientsToSchedule = recipients.slice(canSendToday);

      // Send emails we can send today
      const sendPromises = recipientsToSend.map(async (recipient) => {
        try {
          const mailOptions: MailOptions = {
            to: recipient,
            subject,
            html,
            text
          };
          
          // Set from field to info@dkmedia305.com for newsletters
          if (emailType === 'newsletter') {
            mailOptions.from = 'info@dkmedia305.com';
          }
          
          const result = await this.sendEmail(
            mailOptions,
            emailType
          );

          if (result.success) {
            sent++;
          } else if (result.code === 'LIMIT_EXCEEDED' || result.code === 'SMTP_LIMIT_EXCEEDED') {
            // Limit hit during sending, schedule this one
            const nextDay = this.getNextDayStart();
            const mailOptions: MailOptions = {
              to: recipient,
              subject,
              html,
              text
            };
            
            // Set from field to info@dkmedia305.com for newsletters
            if (emailType === 'newsletter') {
              mailOptions.from = 'info@dkmedia305.com';
            }
            
            await this.scheduleEmail(
              mailOptions,
              emailType,
              nextDay
            );
            scheduled++;
          } else {
            errors.push(`Failed to send to ${recipient}: ${result.error}`);
          }
        } catch (error: any) {
          errors.push(`Error sending to ${recipient}: ${error.message}`);
        }
      });

      await Promise.all(sendPromises);

      // Schedule remaining recipients for next day if any
      if (recipientsToSchedule.length > 0) {
        const nextDay = this.getNextDayStart();
        for (const recipient of recipientsToSchedule) {
          try {
            const mailOptions: MailOptions = {
              to: recipient,
              subject,
              html,
              text
            };
            
            // Set from field to info@dkmedia305.com for newsletters
            if (emailType === 'newsletter') {
              mailOptions.from = 'info@dkmedia305.com';
            }
            
            await this.scheduleEmail(
              mailOptions,
              emailType,
              nextDay
            );
            scheduled++;
          } catch (error: any) {
            errors.push(`Failed to schedule email to ${recipient}: ${error.message}`);
          }
        }
      }

      return {
        success: sent > 0 || scheduled > 0,
        sent,
        scheduled,
        total,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error: any) {
      this.logger?.error('Error in sendBulkEmail', error);
      throw error;
    }
  }

  /**
   * Schedule bulk emails to be sent at a specific time
   * Uses the scheduled email queue which is processed by cron jobs
   * @param recipients - Array of recipient email addresses
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Plain text content (optional)
   * @param scheduledTime - Date when to send the emails
   * @param emailType - Type of email (default: 'newsletter')
   * @returns { success: boolean, scheduled: number, total: number, errors?: string[] }
   */
  async scheduleBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
    scheduledTime: Date,
    text?: string,
    emailType: string = 'newsletter'
  ): Promise<{
    success: boolean;
    scheduled: number;
    total: number;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let scheduled = 0;
    const total = recipients.length;

    try {
      // Schedule each recipient email individually so they can be processed in batches
      // by the ScheduledEmailProcessor respecting daily limits
      for (const recipient of recipients) {
        try {
          const mailOptions: MailOptions = {
            to: recipient,
            subject,
            html,
            text
          };
          
          // Set from field to info@dkmedia305.com for newsletters
          if (emailType === 'newsletter') {
            mailOptions.from = 'info@dkmedia305.com';
          }
          
          await this.scheduleEmail(
            mailOptions,
            emailType,
            scheduledTime
          );
          scheduled++;
        } catch (error: any) {
          errors.push(`Failed to schedule email to ${recipient}: ${error.message}`);
        }
      }

      return {
        success: scheduled > 0,
        scheduled,
        total,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error: any) {
      this.logger?.error('Error in scheduleBulkEmail', error);
      throw error;
    }
  }
}

// Export singleton instance factory
export default (logger?: FastifyBaseLogger) => new EmailService(logger);

