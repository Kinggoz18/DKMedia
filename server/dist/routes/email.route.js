import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import EmailService from "../services/EmailService.js";
export class EmailRoute {
    constructor(server, database, logger) {
        this.basePath = '/email';
        this.server = server;
        this.logger = logger;
        this.emailService = EmailService(logger);
        // Initialize middleware with injected collections
        const authCodeCollection = database.collection('authcodes');
        const userCollection = database.collection('auth');
        this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);
        if (!this.server) {
            this.logger.error("Failed to load server");
            return;
        }
        if (!this.emailService) {
            this.logger.error("Failed to load email service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Get email usage stats route
             */
            const getEmailStatsRoute = {
                method: 'GET',
                url: '/stats',
                config: {
                    rateLimit: {
                        max: 15,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                // Removed preHandler: this.protectMiddleware - GET route doesn't need protection
                handler: async (request, reply) => {
                    try {
                        const stats = await this.emailService.getUsageStats();
                        reply.status(200).send({
                            success: true,
                            data: stats
                        });
                    }
                    catch (error) {
                        this.logger.error('Error getting email stats', error);
                        reply.status(500).send({
                            success: false,
                            data: error.message || 'Failed to retrieve email stats'
                        });
                    }
                }
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(getEmailStatsRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
