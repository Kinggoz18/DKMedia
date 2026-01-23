import amqp, { Connection, Channel, ConsumeMessage, Options } from 'amqplib';
import { Resend } from 'resend';
import { FastifyBaseLogger } from 'fastify';
import RedisQuotaService from './RedisQuotaService.js';
import { EmailJob } from './RabbitMQService.js';
import { generateEmailTemplate } from '../util/emailTemplate.js';

class EmailQueueWorker {
  private connection: Connection | any = null;
  private channel: Channel | null = null;
  private logger?: FastifyBaseLogger;
  private resend: Resend;
  private quotaService: ReturnType<typeof RedisQuotaService>;
  private readonly QUEUE_NAME = 'email_queue';
  private readonly EXCHANGE_NAME = 'email_exchange';
  private readonly DELAY_QUEUE_NAME = 'email_queue_delay_v1';
  private readonly DELAY_EXCHANGE_NAME = 'email_exchange_delay';
  private readonly ROUTING_KEY = 'email';
  private isConsuming: boolean = false;
  private maxRetries: number = 3;
  private readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'info@dkmedia305.com';
  private readonly RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes for transient failures

  constructor(logger?: FastifyBaseLogger) {
    this.logger = logger;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(resendApiKey);
    this.quotaService = RedisQuotaService(logger);
  }

  /**
   * Calculate milliseconds until UTC midnight + 5 seconds
   */
  private calculateTimeUntilMidnight(): number {
    const now = new Date();
    const utcNow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    ));

    // Get next UTC midnight + 5 seconds
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 5, 0 // 00:00:05 UTC
    ));

    const msUntilMidnight = nextMidnight.getTime() - utcNow.getTime();
    return Math.max(msUntilMidnight, 1000); // At least 1 second
  }

  /**
     * Connect to RabbitMQ and set up queues
     */
  async connect(): Promise<void> {
    // Check if connection exists and is actually connected
    // We use the 'any' type to avoid the property missing errors
    if (this.connection) {
      return;
    }

    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

      this.logger?.info('Worker connecting to RabbitMQ...');
      this.connection = await amqp.connect(rabbitmqUrl);

      // Fix Logger: Pass the error object as the first param
      this.connection.on('error', (error: Error) => {
        this.logger?.error({ err: error }, 'Worker RabbitMQ connection error');
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        this.logger?.warn('Worker RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });

      // connection.createChannel() definitely exists on the resolved promise
      this.channel = await this.connection.createChannel();

      if (!this.channel) throw new Error('Failed to create channel');

      await this.setupDelayQueue();
      await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
      await this.channel.prefetch(1);

      this.logger?.info('Worker connected to RabbitMQ successfully');
    } catch (error: any) {
      this.logger?.error({ err: error }, 'Worker failed to connect to RabbitMQ');
      throw error;
    }
  }

  /**
   * Set up delay queue topology for retry/delay mechanism
   */
  private async setupDelayQueue(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    // Create delay exchange (direct exchange)
    await this.channel.assertExchange(this.DELAY_EXCHANGE_NAME, 'direct', { durable: true });

    // Create delay queue with dead letter routing back to main queue
    // Per-message TTL is handled via the 'expiration' property in publish options
    await this.channel.assertQueue(this.DELAY_QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': this.EXCHANGE_NAME,
        'x-dead-letter-routing-key': this.ROUTING_KEY,
      },
    });

    // Bind delay queue to delay exchange
    await this.channel.bindQueue(this.DELAY_QUEUE_NAME, this.DELAY_EXCHANGE_NAME, this.ROUTING_KEY);

    this.logger?.info('Delay queue topology set up successfully');
  }

  /**
   * Re-route message to delay queue with calculated delay
   */
  private async routeToDelayQueue(job: EmailJob, delayMs: number, reason: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    // Increment attempts if this is a retry
    job.attempts = (job.attempts || 0) + 1;

    // Calculate expiration time (current time + delay)
    const expirationTime = Date.now() + delayMs;
    const expirationMs = Math.max(delayMs, 1000); // At least 1 second

    const message = Buffer.from(JSON.stringify(job));
    const options: Options.Publish = {
      persistent: true,
      timestamp: Date.now(),
      expiration: expirationMs.toString(), // Message expiration in milliseconds (as string)
    };

    const published = this.channel.publish(
      this.DELAY_EXCHANGE_NAME,
      this.ROUTING_KEY,
      message,
      options
    );

    if (published) {
      this.logger?.info(
        `Email job ${job.id} routed to delay queue. Reason: ${reason}. Delay: ${delayMs}ms (${Math.round(delayMs / 1000)}s). Expires at: ${new Date(expirationTime).toISOString()}`
      );
    } else {
      this.logger?.error(`Failed to route email job ${job.id} to delay queue`);
      throw new Error('Failed to publish to delay queue');
    }
  }

  /**
   * Start consuming email jobs from the queue
   */
  async start(): Promise<void> {
    if (this.isConsuming) {
      this.logger?.warn('Worker is already consuming');
      return;
    }

    try {
      await this.connect();

      if (!this.channel) {
        throw new Error('Channel not available');
      }

      this.isConsuming = true;
      this.logger?.info('Starting email queue worker...');

      await this.channel.consume(
        this.QUEUE_NAME,
        async (msg: ConsumeMessage | null) => {
          if (!msg) {
            return;
          }

          try {
            await this.processEmailJob(msg);
          } catch (error: any) {
            this.logger?.error({ err: error }, 'Error processing email job');
            // Parse job to check attempts
            const job = this.parseJob(msg);
            if (job) {
              if ((job.attempts || 0) < this.maxRetries) {
                // Route to delay queue for retry
                await this.routeToDelayQueue(job, this.RETRY_DELAY_MS, 'Processing error');
                this.channel?.ack(msg); // Ack original message
              } else {
                // Max retries reached, send to DLQ
                this.logger?.error(`Email job ${job.id} exceeded max retries, sending to DLQ`);
                this.channel?.nack(msg, false, false); // Don't requeue, send to DLQ
              }
            } else {
              // Invalid job, discard
              this.channel?.ack(msg);
            }
          }
        },
        { noAck: false }
      );

      this.logger?.info('Email queue worker started and consuming messages');
    } catch (error: any) {
      this.isConsuming = false;
      this.logger?.error({ err: error }, 'Error starting email queue worker');
      throw error;
    }
  }

  /**
   * Process a single email job
   */
  private async processEmailJob(msg: ConsumeMessage): Promise<void> {
    const job = this.parseJob(msg);

    if (!job) {
      this.logger?.error('Invalid job message, discarding');
      this.channel?.ack(msg);
      return;
    }

    // Re-verify expiration before sending (safety check after delay queue)
    if (job.expiresAt) {
      const now = new Date();
      // Handle both string and Date types
      const expiresAt = typeof job.expiresAt === 'string' ? new Date(job.expiresAt) : job.expiresAt;

      if (now > expiresAt) {
        this.logger?.warn(`Email job ${job.id} expired at ${expiresAt.toISOString()}, discarding`);
        this.channel?.ack(msg);
        return;
      }
    }

    // Check if email is scheduled for future
    if (job.scheduledTime) {
      const now = new Date();
      // Handle both string and Date types
      const scheduledTime = typeof job.scheduledTime === 'string' ? new Date(job.scheduledTime) : job.scheduledTime;

      if (now < scheduledTime) {
        // Calculate delay until scheduled time
        const delayMs = scheduledTime.getTime() - now.getTime();
        if (delayMs > 0) {
          this.logger?.info(`Email job ${job.id} scheduled for ${scheduledTime.toISOString()}, routing to delay queue`);
          await this.routeToDelayQueue(job, delayMs, 'Scheduled for future');
          this.channel?.ack(msg); // Ack original message
          return;
        }
      }
    }

    // Check if worker is paused (quota reached)
    const isPaused = await this.quotaService.isPaused();
    if (isPaused) {
      // Check if we can resume (new day started)
      const stats = await this.quotaService.getStats();
      if (!stats.isPaused) {
        // Resume if quota was reset
        await this.quotaService.resumeWorker();
        // Continue processing below
      } else {
        // Still paused, calculate delay until UTC midnight + 5 seconds
        const delayMs = this.calculateTimeUntilMidnight();
        this.logger?.warn(`Email job ${job.id} paused due to quota, routing to delay queue until next day (${Math.round(delayMs / 1000)}s)`);
        await this.routeToDelayQueue(job, delayMs, 'Quota reached - waiting for next day');
        this.channel?.ack(msg); // Ack original message
        return;
      }
    }

    // Check quota before sending
    const canSend = await this.quotaService.canSend(1);
    if (!canSend) {
      this.logger?.warn(`Email job ${job.id} cannot be sent - quota reached, routing to delay queue`);
      await this.quotaService.pauseWorker();
      const delayMs = this.calculateTimeUntilMidnight();
      await this.routeToDelayQueue(job, delayMs, 'Quota reached - waiting for next day');
      this.channel?.ack(msg); // Ack original message
      return;
    }

    // Send the email
    try {
      const result = await this.sendEmail(job);

      if (result.success) {
        // Increment quota counter
        await this.quotaService.incrementCount(1);

        this.logger?.info(`Email sent successfully: ${job.id}, to: ${Array.isArray(job.to) ? job.to.join(', ') : job.to}`);
        this.channel?.ack(msg);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      this.logger?.error({ err: error, jobId: job.id }, `Error sending email ${job.id}`);

      // Increment attempts
      job.attempts = (job.attempts || 0) + 1;

      if (job.attempts >= this.maxRetries) {
        this.logger?.error(`Email job ${job.id} failed after ${job.attempts} attempts, sending to DLQ`);
        this.channel?.nack(msg, false, false); // Don't requeue, send to DLQ
      } else {
        // Route to delay queue for retry (transient failure)
        this.logger?.warn(`Email job ${job.id} failed, will retry in ${Math.round(this.RETRY_DELAY_MS / 1000)}s (attempt ${job.attempts}/${this.maxRetries})`);
        await this.routeToDelayQueue(job, this.RETRY_DELAY_MS, `Send failed - retry attempt ${job.attempts}`);
        this.channel?.ack(msg); // Ack original message
      }
    }
  }

  /**
   * Send email using Resend
   */
  private async sendEmail(job: EmailJob): Promise<{ success: boolean; error?: string }> {
    try {
      // Wrap HTML in template if needed
      let html = job.html;
      if (html && !html.includes('<!DOCTYPE html>')) {
        html = this.wrapInTemplate(html, job.subject);
      }

      // Generate plain text if not provided
      let text = job.text;
      if (!text && html) {
        text = html
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const recipients = Array.isArray(job.to) ? job.to : [job.to];

      // Resend supports multiple recipients in 'to' field
      const result = await this.resend.emails.send({
        from: job.from || this.FROM_EMAIL,
        to: recipients,
        subject: job.subject,
        html: html,
        text: text || job.subject,
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Resend API error',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Wrap content in DKMedia email template
   */
  private wrapInTemplate(html: string, subject?: string): string {
    // Check if already wrapped
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

    const frontendUrl = process.env.FRONTEND_URL || process.env.SITE_URL || 'http://localhost:5173';
    const unsubscribeUrl = `${frontendUrl}/unsubscribe`;

    return generateEmailTemplate({
      heading,
      content,
      includeUnsubscribe: true,
      unsubscribeUrl,
    });
  }

  /**
   * Parse job from message
   */
  private parseJob(msg: ConsumeMessage): EmailJob | null {
    try {
      const content = msg.content.toString();
      return JSON.parse(content) as EmailJob;
    } catch (error: any) {
      this.logger?.error({ err: error }, 'Error parsing email job');
      return null;
    }
  }

  /**
   * Stop consuming
   */
  async stop(): Promise<void> {
    this.isConsuming = false;

    if (this.channel) {
      await this.channel.cancel(''); // Cancel all consumers
    }

    this.logger?.info('Email queue worker stopped');
  }

  /**
     * Close connection
     */
  async close(): Promise<void> {
    await this.stop();

    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        // .close() exists on the connection object returned by amqp.connect
        await this.connection.close();
        this.connection = null;
      }
      await this.quotaService.close();
      this.logger?.info('Email queue worker closed');
    } catch (error: any) {
      this.logger?.error({ err: error }, 'Error closing email queue worker');
    }
  }
}

export default EmailQueueWorker;
