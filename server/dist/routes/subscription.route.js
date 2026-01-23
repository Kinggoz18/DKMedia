import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { AddSubscriptionValidationSchema } from "../types/subscription.type.js";
import { SubscriptionService } from "../services/Subscription.service.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class SubscriptionRoute {
    constructor(server, database, logger) {
        this.basePath = '/subscriptions';
        this.server = server;
        this.collection = database.collection('subscription');
        this.service = new SubscriptionService(this.collection, logger);
        this.logger = logger;
        // Initialize middleware with injected collections
        const authCodeCollection = database.collection('authcodes');
        const userCollection = database.collection('auth');
        this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);
        if (!this.server) {
            this.logger.error("Failed to load server");
            return;
        }
        if (!this.collection) {
            this.logger.error("Failed to load subscription collection");
            return;
        }
        if (!this.service) {
            this.logger.error("Failed to load subscription service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Add subscription route
             */
            const addSubscriptionRoute = {
                method: 'POST',
                url: '/',
                config: {
                    rateLimit: {
                        max: 2, //2 Subscription attempt per every 1 hour
                        timeWindow: 60 * 1000 * 60 //1 hour
                    }
                },
                schema: {
                    body: AddSubscriptionValidationSchema,
                    response: IReply.$schema,
                },
                // Note: This is a public endpoint (subscription from public site), not protected
                handler: (request, reply) => this.service.addSubscription(request, reply)
            };
            /**
             * Delete subscription route
             */
            const deleteSubscriptionRoute = {
                method: 'DELETE',
                url: '/:id',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteSubscription(request, reply)
            };
            /**
             * Get all subscription route
             */
            const getAllSubscriptionRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getAllSubscription(request, reply)
            };
            /**
            * Get subscription route
            */
            const getSubscriptionByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getSubscription(request, reply)
            };
            /**
             * Unsubscribe by email route
             */
            const unsubscribeByEmailRoute = {
                method: 'POST',
                url: '/unsubscribe',
                config: {
                    rateLimit: {
                        max: 5, // 5 attempts per hour
                        timeWindow: 60 * 1000 * 60 // 1 hour
                    }
                },
                handler: (request, reply) => this.service.unsubscribeByEmail(request, reply)
            };
            /**
             * Send bulk newsletter route
             */
            const sendBulkNewsletterRoute = {
                method: 'POST',
                url: '/send-newsletter',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: {
                        type: 'object',
                        required: ['subject', 'message'],
                        properties: {
                            subject: { type: 'string' },
                            message: { type: 'string' },
                            html: { type: 'string' },
                            expiresAt: { type: 'string', format: 'date-time' }
                        }
                    },
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.sendBulkNewsletter(request, reply)
            };
            /**
             * Schedule bulk newsletter route
             */
            const scheduleBulkNewsletterRoute = {
                method: 'POST',
                url: '/schedule-newsletter',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: {
                        type: 'object',
                        required: ['subject', 'message', 'scheduledTime'],
                        properties: {
                            subject: { type: 'string' },
                            message: { type: 'string' },
                            scheduledTime: { type: 'string', format: 'date-time' },
                            html: { type: 'string' },
                            expiresAt: { type: 'string', format: 'date-time' }
                        }
                    },
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.scheduleBulkNewsletter(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addSubscriptionRoute);
                app.route(deleteSubscriptionRoute);
                app.route(getAllSubscriptionRoute);
                app.route(getSubscriptionByIdRoute);
                app.route(unsubscribeByEmailRoute);
                app.route(sendBulkNewsletterRoute);
                app.route(scheduleBulkNewsletterRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
