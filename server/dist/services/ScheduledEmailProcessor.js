import EmailServiceFactory from './EmailService.js';
import { ScheduledEmailModel } from '../schema/scheduledEmail.js';
import cron from 'node-cron';
class ScheduledEmailProcessor {
    constructor(logger) {
        this.maxAttempts = 5;
        this.logger = logger;
        this.emailService = EmailServiceFactory(logger);
    }
    /**
     * Get the start of the next day (midnight) for rescheduling emails
     */
    getNextDayStart() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to midnight
        return tomorrow;
    }
    /**
     * Start processing scheduled emails using cron job
     * Runs every minute to check for emails ready to be sent
     */
    start() {
        this.logger?.info('Starting scheduled email processor with cron job');
        // Process immediately on start
        this.processScheduledEmails();
        // Schedule cron job to run every minute
        // Cron format: '* * * * *' means every minute
        this.cronJob = cron.schedule('* * * * *', async () => {
            await this.processScheduledEmails();
        });
        this.logger?.info('Scheduled email processor started (running every minute)');
    }
    /**
     * Stop processing scheduled emails
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = undefined;
            this.logger?.info('Stopped scheduled email processor');
        }
    }
    /**
     * Process emails that are scheduled to be sent
     */
    async processScheduledEmails() {
        try {
            // Get pending emails scheduled for now or earlier (limit to 10 at a time to avoid overload)
            const pendingEmails = await ScheduledEmailModel.getPendingEmails(10);
            if (pendingEmails.length === 0) {
                return;
            }
            this.logger?.info(`Processing ${pendingEmails.length} scheduled email(s)`);
            for (const scheduledEmail of pendingEmails) {
                try {
                    // Mark as processing to prevent concurrent processing
                    const updatedEmail = await ScheduledEmailModel.markAsProcessing(scheduledEmail._id);
                    if (!updatedEmail) {
                        this.logger?.warn(`Failed to mark email as processing: ${scheduledEmail._id}`);
                        continue;
                    }
                    // Attempt to send the email
                    const result = await this.emailService.sendEmail(scheduledEmail.mailOptions, scheduledEmail.emailType);
                    if (result.success) {
                        // Mark as sent
                        await ScheduledEmailModel.markAsSent(scheduledEmail._id);
                        this.logger?.info(`Scheduled email sent successfully - emailId: ${scheduledEmail._id}, emailType: ${scheduledEmail.emailType}, subject: ${scheduledEmail.mailOptions.subject}`);
                    }
                    else {
                        // Handle different error cases
                        if (result.code === 'LIMIT_EXCEEDED' || result.code === 'SMTP_LIMIT_EXCEEDED') {
                            // If limit still exceeded, reschedule for start of next day (midnight)
                            const nextDay = this.getNextDayStart();
                            await ScheduledEmailModel.markAsFailed(scheduledEmail._id, result.error || 'Limit exceeded', nextDay);
                            this.logger?.warn(`Scheduled email still over limit, rescheduled for next day - emailId: ${scheduledEmail._id}, emailType: ${scheduledEmail.emailType}, nextDay: ${nextDay}`);
                        }
                        else if (updatedEmail.attempts >= this.maxAttempts) {
                            // Max attempts reached, mark as failed
                            await ScheduledEmailModel.markAsFailed(scheduledEmail._id, result.error || 'Max attempts reached', undefined);
                            this.logger?.error(`Scheduled email failed after max attempts - emailId: ${scheduledEmail._id}, emailType: ${scheduledEmail.emailType}, attempts: ${updatedEmail.attempts}`);
                        }
                        else {
                            // Retry later (exponential backoff: 2^attempts minutes)
                            const retryMinutes = Math.min(Math.pow(2, updatedEmail.attempts), 60); // Max 60 minutes
                            const retryTime = new Date(Date.now() + (retryMinutes * 60 * 1000));
                            await ScheduledEmailModel.markAsFailed(scheduledEmail._id, result.error || 'Send failed, will retry', retryTime);
                            this.logger?.warn(`Scheduled email failed, will retry later - emailId: ${scheduledEmail._id}, emailType: ${scheduledEmail.emailType}, attempts: ${updatedEmail.attempts}, retryTime: ${retryTime}`);
                        }
                    }
                }
                catch (error) {
                    this.logger?.error(`Error processing scheduled email - emailId: ${scheduledEmail._id}, error: ${error.message}`);
                    // Mark as failed if max attempts reached
                    const emailDoc = scheduledEmail;
                    if (emailDoc.attempts >= this.maxAttempts) {
                        await ScheduledEmailModel.markAsFailed(scheduledEmail._id, error.message || 'Processing error', undefined);
                    }
                    else {
                        // Retry later
                        const retryMinutes = Math.min(Math.pow(2, emailDoc.attempts), 60);
                        const retryTime = new Date(Date.now() + (retryMinutes * 60 * 1000));
                        await ScheduledEmailModel.markAsFailed(scheduledEmail._id, error.message || 'Processing error', retryTime);
                    }
                }
            }
        }
        catch (error) {
            this.logger?.error('Error in processScheduledEmails', error);
        }
    }
}
export default ScheduledEmailProcessor;
