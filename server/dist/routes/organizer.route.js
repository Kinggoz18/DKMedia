import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { OrganizerService } from "../services/organizer.service.js";
import { AddOrganizerValidationSchema, UpdateOrganizerValidationSchema } from "../types/organizer.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class OrganizerRoute {
    constructor(server, database, logger) {
        this.basePath = '/organizers';
        this.server = server;
        this.collection = database.collection('organizer');
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
            this.logger.error("Failed to load organizer collection");
            return;
        }
        // Initialize CloudflareR2BucketManager
        const r2BucketManager = new CloudflareR2BucketManager(logger);
        // Initialize service with R2BucketManager
        this.service = new OrganizerService(this.collection, logger, r2BucketManager);
        if (!this.service) {
            this.logger.error("Failed to load organizer service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Add an organizer route
             */
            const addOrganizerRoute = {
                method: 'POST',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: AddOrganizerValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.addOrganizer(request, reply)
            };
            /**
            * Delete an organizer route
            */
            const deleteOrganizerRoute = {
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
                handler: (request, reply) => this.service.deleteOrganizer(request, reply)
            };
            /**
            * Get all organizer route
            */
            const getAllOrganizersRoute = {
                method: 'GET',
                url: '/',
                config: {
                    rateLimit: {
                        max: 15,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                handler: (request, reply) => this.service.getAllOrganizer(request, reply)
            };
            /**
            * Get an organizer route
            */
            const getOrganizerByIdRoute = {
                method: 'GET',
                url: '/:id',
                config: {
                    rateLimit: {
                        max: 15,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                handler: (request, reply) => this.service.getOrganizerById(request, reply)
            };
            /**
            * Update an organizer route
            */
            const updateOrganizerByIdRoute = {
                method: 'PUT',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: UpdateOrganizerValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.updateOrganizer(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addOrganizerRoute);
                app.route(deleteOrganizerRoute);
                app.route(getOrganizerByIdRoute);
                app.route(getAllOrganizersRoute);
                app.route(updateOrganizerByIdRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
