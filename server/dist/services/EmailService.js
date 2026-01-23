import { v4 as uuidv4 } from 'uuid';
import RabbitMQService from './RabbitMQService.js';
import RedisQuotaService from './RedisQuotaService.js';
class EmailService {
    constructor(logger) {
        this.FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'info@dkmedia305.com';
        this.logger = logger;
        this.rabbitmqService = RabbitMQService(logger);
        this.quotaService = RedisQuotaService(logger);
    }
    /**
     * Count total recipients from email options
     */
    countRecipients(mailOptions) {
        let count = 0;
        if (mailOptions.to) {
            const toArray = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
            count += toArray.length;
        }
        if (mailOptions.cc) {
            const ccArray = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
            count += ccArray.length;
        }
        if (mailOptions.bcc) {
            const bccArray = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
            count += bccArray.length;
        }
        return count || 1;
    }
    /**
     * Check if we can send emails with the given recipient count
     */
    async checkLimit(recipientCount) {
        const stats = await this.quotaService.getStats();
        const canSend = await this.quotaService.canSend(recipientCount);
        return {
            canSend,
            currentCount: stats.currentCount,
            dailyLimit: stats.dailyLimit,
            remaining: stats.remaining,
            percentageUsed: stats.percentageUsed,
            requestedCount: recipientCount,
        };
    }
    /**
     * Get current email usage statistics
     */
    async getUsageStats() {
        const stats = await this.quotaService.getStats();
        return {
            currentCount: stats.currentCount,
            dailyLimit: stats.dailyLimit,
            remaining: stats.remaining,
            percentageUsed: stats.percentageUsed,
            isPaused: stats.isPaused,
        };
    }
    /**
     * Get the start of the next day (midnight UTC) for scheduling emails
     */
    getNextDayStart() {
        return this.quotaService.getNextDayStartTime();
    }
    /**
     * Queue an email job to be sent
     * @param mailOptions - Email options
     * @param emailType - Type of email
     * @param scheduledTime - Optional scheduled time
     * @param expiresAt - Optional expiration date
     */
    async queueEmail(mailOptions, emailType = 'general', scheduledTime, expiresAt) {
        try {
            const recipientCount = this.countRecipients(mailOptions);
            const recipients = this.extractRecipients(mailOptions);
            // Create email job
            const job = {
                id: uuidv4(),
                to: recipients,
                subject: mailOptions.subject,
                html: mailOptions.html || '',
                text: mailOptions.text,
                from: mailOptions.from || this.FROM_EMAIL,
                emailType,
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                scheduledTime: scheduledTime ? scheduledTime.toISOString() : undefined,
                attempts: 0,
            };
            // Calculate delay if scheduled for future
            let delay;
            if (scheduledTime) {
                const now = new Date();
                const delayMs = scheduledTime.getTime() - now.getTime();
                if (delayMs > 0) {
                    delay = delayMs;
                }
            }
            // Publish to queue
            const published = await this.rabbitmqService.publishEmailJob(job, delay);
            if (published) {
                this.logger?.info({
                    msg: 'Email job queued',
                    jobId: job.id,
                    emailType,
                    recipientCount,
                    scheduledTime: scheduledTime?.toISOString(),
                });
                return {
                    success: true,
                    jobId: job.id,
                };
            }
            else {
                return {
                    success: false,
                    jobId: job.id,
                    error: 'Failed to queue email job - buffer full',
                };
            }
        }
        catch (error) {
            this.logger?.error('Error queueing email', error);
            return {
                success: false,
                jobId: '',
                error: error.message || 'Failed to queue email',
            };
        }
    }
    /**
     * Extract recipients from mail options (combines to, cc, bcc)
     * For Resend, we'll send to all recipients in the 'to' field
     */
    extractRecipients(mailOptions) {
        const recipients = [];
        if (mailOptions.to) {
            const toArray = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
            recipients.push(...toArray);
        }
        if (mailOptions.cc) {
            const ccArray = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
            recipients.push(...ccArray);
        }
        if (mailOptions.bcc) {
            const bccArray = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
            recipients.push(...bccArray);
        }
        return recipients.length > 0 ? recipients : [];
    }
    /**
     * Send an email (queues it for processing)
     * @param mailOptions - Email options
     * @param emailType - Type of email
     * @returns Result object
     */
    async sendEmail(mailOptions, emailType = 'general') {
        try {
            const recipientCount = this.countRecipients(mailOptions);
            // Check quota
            const limitCheck = await this.checkLimit(recipientCount);
            if (!limitCheck.canSend) {
                // Schedule for next day
                const nextDay = this.getNextDayStart();
                const result = await this.queueEmail(mailOptions, emailType, nextDay);
                if (result.success) {
                    return {
                        success: false,
                        error: `Email sending limit exceeded. Current usage: ${limitCheck.currentCount}/${limitCheck.dailyLimit}. Requested: ${recipientCount}. Email queued for next day.`,
                        limitInfo: limitCheck,
                        code: 'LIMIT_EXCEEDED',
                    };
                }
                else {
                    return {
                        success: false,
                        error: result.error || 'Failed to queue email',
                        limitInfo: limitCheck,
                        code: 'QUEUE_ERROR',
                    };
                }
            }
            // Queue email for immediate processing
            const result = await this.queueEmail(mailOptions, emailType);
            if (result.success) {
                const stats = await this.quotaService.getStats();
                this.logger?.info({
                    msg: 'Email queued successfully',
                    jobId: result.jobId,
                    recipientCount,
                    emailType,
                    limitInfo: stats,
                });
                return {
                    success: true,
                    messageId: result.jobId,
                    recipientCount,
                    limitInfo: {
                        currentCount: stats.currentCount,
                        dailyLimit: stats.dailyLimit,
                        remaining: stats.remaining,
                        percentageUsed: stats.percentageUsed,
                        requestedCount: recipientCount,
                    },
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || 'Failed to queue email',
                    code: 'QUEUE_ERROR',
                };
            }
        }
        catch (error) {
            this.logger?.error('Error in sendEmail', error);
            return {
                success: false,
                error: error.message || 'Failed to send email',
                code: 'SEND_ERROR',
            };
        }
    }
    /**
     * Send bulk emails to multiple recipients
     * @param recipients - Array of recipient email addresses
     * @param subject - Email subject
     * @param html - HTML content
     * @param text - Plain text content (optional)
     * @param emailType - Type of email (default: 'newsletter')
     * @param expiresAt - Optional expiration date
     */
    async sendBulkEmail(recipients, subject, html, text, emailType = 'newsletter', expiresAt) {
        const errors = [];
        let queued = 0;
        let scheduled = 0;
        const total = recipients.length;
        try {
            // Get current usage stats
            const stats = await this.quotaService.getStats();
            const remaining = stats.remaining;
            if (remaining <= 0) {
                // No remaining emails today, schedule all for next day
                const nextDay = this.getNextDayStart();
                const jobs = recipients.map((recipient) => ({
                    id: uuidv4(),
                    to: recipient,
                    subject,
                    html,
                    text,
                    from: emailType === 'newsletter' ? this.FROM_EMAIL : undefined,
                    emailType,
                    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                    scheduledTime: nextDay.toISOString(),
                    attempts: 0,
                }));
                const result = await this.rabbitmqService.publishBulkEmailJobs(jobs);
                scheduled = result.published;
                return {
                    success: scheduled > 0,
                    sent: 0,
                    scheduled,
                    total,
                    errors: errors.length > 0 ? errors : undefined,
                };
            }
            // Determine how many we can send today
            const canSendToday = Math.min(remaining, recipients.length);
            const recipientsToSend = recipients.slice(0, canSendToday);
            const recipientsToSchedule = recipients.slice(canSendToday);
            // Queue emails we can send today
            const jobs = recipientsToSend.map((recipient) => ({
                id: uuidv4(),
                to: recipient,
                subject,
                html,
                text,
                from: emailType === 'newsletter' ? this.FROM_EMAIL : undefined,
                emailType,
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                attempts: 0,
            }));
            const sendResult = await this.rabbitmqService.publishBulkEmailJobs(jobs);
            queued = sendResult.published;
            // Schedule remaining recipients for next day if any
            if (recipientsToSchedule.length > 0) {
                const nextDay = this.getNextDayStart();
                const scheduledJobs = recipientsToSchedule.map((recipient) => ({
                    id: uuidv4(),
                    to: recipient,
                    subject,
                    html,
                    text,
                    from: emailType === 'newsletter' ? this.FROM_EMAIL : undefined,
                    emailType,
                    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                    scheduledTime: nextDay.toISOString(),
                    attempts: 0,
                }));
                const scheduleResult = await this.rabbitmqService.publishBulkEmailJobs(scheduledJobs);
                scheduled = scheduleResult.published;
            }
            return {
                success: queued > 0 || scheduled > 0,
                sent: queued,
                scheduled,
                total,
                errors: errors.length > 0 ? errors : undefined,
            };
        }
        catch (error) {
            this.logger?.error('Error in sendBulkEmail', error);
            throw error;
        }
    }
    /**
     * Schedule bulk emails to be sent at a specific time
     * @param recipients - Array of recipient email addresses
     * @param subject - Email subject
     * @param html - HTML content
     * @param scheduledTime - Date when to send the emails
     * @param text - Plain text content (optional)
     * @param emailType - Type of email (default: 'newsletter')
     * @param expiresAt - Optional expiration date
     */
    async scheduleBulkEmail(recipients, subject, html, scheduledTime, text, emailType = 'newsletter', expiresAt) {
        const errors = [];
        let scheduled = 0;
        const total = recipients.length;
        try {
            const jobs = recipients.map((recipient) => ({
                id: uuidv4(),
                to: recipient,
                subject,
                html,
                text,
                from: emailType === 'newsletter' ? this.FROM_EMAIL : undefined,
                emailType,
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                scheduledTime: scheduledTime.toISOString(),
                attempts: 0,
            }));
            const result = await this.rabbitmqService.publishBulkEmailJobs(jobs);
            scheduled = result.published;
            return {
                success: scheduled > 0,
                scheduled,
                total,
                errors: errors.length > 0 ? errors : undefined,
            };
        }
        catch (error) {
            this.logger?.error('Error in scheduleBulkEmail', error);
            throw error;
        }
    }
}
// Export singleton instance factory
export default (logger) => new EmailService(logger);
