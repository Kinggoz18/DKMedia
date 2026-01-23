import { IReply } from "../interfaces/IReply.js";
import { AboutUsService } from "../services/aboutUs.service.js";
import { AddAboutUsValidation } from "../types/aboutUs.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class AboutUsRoute {
    constructor(server, database, logger) {
        this.basePath = '/about-us';
        this.server = server;
        this.collection = database.collection('about');
        this.service = new AboutUsService(this.collection, logger);
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
            this.logger.error("Failed to load about us collection");
            return;
        }
        if (!this.service) {
            this.logger.error("Failed to load about us service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Update about us section route
             */
            const updateAboutUsRoute = {
                method: 'POST',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: AddAboutUsValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.updateAboutUs(request, reply)
            };
            /**
             * Delete about us section route
             */
            const deleteAboutUsRoute = {
                method: 'DELETE',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteAboutUs(request, reply)
            };
            /**
             * Get about us section route
             */
            const getAboutUs = {
                method: 'GET',
                url: '/',
                config: {
                    rateLimit: {
                        max: 15,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                handler: (request, reply) => this.service.getAboutUs(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(updateAboutUsRoute);
                app.route(deleteAboutUsRoute);
                app.route(getAboutUs);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
