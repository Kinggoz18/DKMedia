import amqp from 'amqplib';
class RabbitMQService {
    constructor(logger) {
        this.connection = null;
        this.channel = null;
        this.QUEUE_NAME = 'email_queue';
        this.EXCHANGE_NAME = 'email_exchange';
        this.DLX_NAME = 'email_dlx'; // Dead Letter Exchange
        this.DLQ_NAME = 'email_dlq'; // Dead Letter Queue
        this.isConnecting = false;
        this.logger = logger;
    }
    /**
     * Connect to RabbitMQ
     */
    async connect() {
        // Check if connection exists and is actually connected
        // We use the 'any' type to avoid the property missing errors
        if (this.connection) {
            return;
        }
        if (this.isConnecting) {
            // Wait for existing connection attempt
            while (this.isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }
        this.isConnecting = true;
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.logger?.info('Connecting to RabbitMQ...');
            this.connection = await amqp.connect(rabbitmqUrl);
            this.connection.on('error', (error) => {
                this.logger?.error({ err: error }, 'RabbitMQ connection error');
                this.connection = null;
                this.channel = null;
            });
            this.connection.on('close', () => {
                this.logger?.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            });
            this.channel = await this.connection.createChannel();
            // Set up exchange, queue, and dead letter queue
            await this.setupQueues();
            this.logger?.info('RabbitMQ connected successfully');
        }
        catch (error) {
            this.logger?.error({ err: error }, 'Failed to connect to RabbitMQ');
            this.connection = null;
            this.channel = null;
            throw error;
        }
        finally {
            this.isConnecting = false;
        }
    }
    /**
     * Set up queues, exchanges, and dead letter queue
     */
    async setupQueues() {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        // Create dead letter exchange
        await this.channel.assertExchange(this.DLX_NAME, 'direct', { durable: true });
        // Create dead letter queue
        await this.channel.assertQueue(this.DLQ_NAME, {
            durable: true,
            arguments: {
                'x-message-ttl': 7 * 24 * 60 * 60 * 1000, // 7 days TTL
            },
        });
        await this.channel.bindQueue(this.DLQ_NAME, this.DLX_NAME, 'failed');
        // Create main exchange
        await this.channel.assertExchange(this.EXCHANGE_NAME, 'direct', { durable: true });
        // Create main queue - minimal configuration to avoid 406 PRECONDITION-FAILED errors
        // Dead letter routing and TTL are handled at the message level or via delay queue
        await this.channel.assertQueue(this.QUEUE_NAME, {
            durable: true,
        });
        // Bind queue to exchange
        await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, 'email');
        this.logger?.info('RabbitMQ queues and exchanges set up successfully');
    }
    /**
     * Publish an email job to the queue
     * @param job - Email job data
     * @param delay - Optional delay in milliseconds (for scheduled emails)
     */
    async publishEmailJob(job, delay) {
        try {
            await this.connect();
            if (!this.channel) {
                throw new Error('Channel not available');
            }
            const message = Buffer.from(JSON.stringify(job));
            const options = {
                persistent: true,
                timestamp: Date.now(),
            };
            // If delay is specified, use delayed message plugin or schedule
            if (delay && delay > 0) {
                // For scheduled emails, we'll use the scheduledTime in the job
                // RabbitMQ doesn't natively support delayed messages without plugin
                // So we'll handle scheduling in the worker
                options.headers = {
                    'x-delay': delay,
                };
            }
            const published = this.channel.publish(this.EXCHANGE_NAME, 'email', message, options);
            if (published) {
                this.logger?.info(`Email job published: ${job.id}, type: ${job.emailType}`);
                return true;
            }
            else {
                this.logger?.warn(`Failed to publish email job: ${job.id} - buffer full`);
                return false;
            }
        }
        catch (error) {
            this.logger?.error({ err: error }, 'Error publishing email job');
            throw error;
        }
    }
    /**
     * Publish multiple email jobs
     * @param jobs - Array of email jobs
     */
    async publishBulkEmailJobs(jobs) {
        let published = 0;
        let failed = 0;
        for (const job of jobs) {
            try {
                const success = await this.publishEmailJob(job);
                if (success) {
                    published++;
                }
                else {
                    failed++;
                }
            }
            catch (error) {
                this.logger?.error({ err: error, jobId: job.id }, `Error publishing job ${job.id}`);
                failed++;
            }
        }
        return { published, failed };
    }
    /**
     * Get queue statistics
     */
    async getQueueStats() {
        try {
            await this.connect();
            if (!this.channel) {
                throw new Error('Channel not available');
            }
            const [queueInfo, dlqInfo] = await Promise.all([
                this.channel.checkQueue(this.QUEUE_NAME),
                this.channel.checkQueue(this.DLQ_NAME),
            ]);
            return {
                queue: queueInfo.messageCount,
                dlq: dlqInfo.messageCount,
            };
        }
        catch (error) {
            this.logger?.error({ err: error }, 'Error getting queue stats');
            throw error;
        }
    }
    /**
     * Close connection
     */
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            this.logger?.info('RabbitMQ connection closed');
        }
        catch (error) {
            this.logger?.error({ err: error }, 'Error closing RabbitMQ connection');
        }
    }
    /**
     * Get the queue name (for worker consumption)
     */
    getQueueName() {
        return this.QUEUE_NAME;
    }
}
// Export singleton factory
export default (logger) => new RabbitMQService(logger);
