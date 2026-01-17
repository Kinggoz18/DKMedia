import { IReply } from "../interfaces/IReply.js";
import { NewsletterHistoryService } from "../services/newsletterHistory.service.js";
import { AddNewsletterHistoryValidationSchema } from "../types/newsletterHistory.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class NewsletterHistoryRoute {
    constructor(server, database, logger) {
        this.basePath = '/newsletter-history';
        this.server = server;
        this.collection = database.collection('newsletter_history');
        this.service = new NewsletterHistoryService(this.collection, logger);
        this.logger = logger;
        // Initialize middleware with injected collections
        const authCodeCollection = database.collection('authcodes');
        const userCollection = database.collection('auth');
        this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);
        if (!this.server) {
            console.error("Error: Failed to load server");
            this.logger.error("Failed to load server");
            return;
        }
        if (!this.collection) {
            console.error("Error: Failed to load newsletter history collection");
            this.logger.error("Failed to load newsletter history collection");
            return;
        }
        if (!this.service) {
            console.error("Error: Failed to load newsletter history service");
            this.logger.error("Failed to load newsletter history service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Add newsletter history route
             */
            const addNewsletterHistoryRoute = {
                method: 'POST',
                url: '/',
                schema: {
                    body: AddNewsletterHistoryValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.addNewsletterHistory(request, reply)
            };
            /**
             * Get newsletter history with pagination route
             */
            const getNewsletterHistoryRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getNewsletterHistory(request, reply)
            };
            /**
             * Get newsletter history by id route
             */
            const getNewsletterHistoryByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getNewsletterHistoryById(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addNewsletterHistoryRoute);
                app.route(getNewsletterHistoryRoute);
                app.route(getNewsletterHistoryByIdRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            console.error({ error });
            this.logger.error({ error });
            return;
        }
    }
}
