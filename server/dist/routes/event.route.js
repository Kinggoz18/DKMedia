import { EventService } from "../services/events.service.js";
import { AddEventValidationSchema, UpdateEventValidationSchema } from "../types/event.type.js";
import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class EventRoute {
    constructor(server, database, logger) {
        this.basePath = '/events';
        this.server = server;
        this.collection = database.collection('event');
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
            console.error("Error: Failed to load event collection");
            this.logger.error("Failed to load event collection");
            return;
        }
        // Initialize CloudflareR2BucketManager
        const r2BucketManager = new CloudflareR2BucketManager(logger);
        // Initialize service with R2BucketManager
        this.service = new EventService(this.collection, logger, r2BucketManager);
        if (!this.service) {
            console.error("Error: Failed to load event service");
            this.logger.error("Failed to load event service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Add event route
             */
            const addEventRoute = {
                method: 'POST',
                url: '/',
                schema: {
                    body: AddEventValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.addEvent(request, reply)
            };
            /**
             * Delete event route
             */
            const deleteEventRoute = {
                method: 'DELETE',
                url: '/:id',
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteEvent(request, reply)
            };
            /**
             * Get all events route
             */
            const getAllEventsRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getAllEvents(request, reply)
            };
            /**
             * Get an event by Id route
             */
            const getEventByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getEventById(request, reply)
            };
            /**
             * Update an event route
             */
            const updateEventByIdRoute = {
                method: 'PUT',
                url: '/',
                schema: {
                    body: UpdateEventValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.updateEventById(request, reply)
            };
            const uploadImageRoute = {
                method: 'POST',
                url: '/upload/image',
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.uploadImage(request, reply)
            };
            const uploadVideoRoute = {
                method: 'POST',
                url: '/upload/video',
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.uploadVideo(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addEventRoute);
                app.route(deleteEventRoute);
                app.route(getEventByIdRoute);
                app.route(getAllEventsRoute);
                app.route(updateEventByIdRoute);
                app.route(uploadImageRoute);
                app.route(uploadVideoRoute);
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
