import { IReply } from "../interfaces/IReply.js";
import { ContactService } from "../services/contact.service.js";
import { UpdateContactValidationSchema } from "../types/contact.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class ContactRoute {
    constructor(server, database, logger) {
        this.basePath = '/contact';
        this.server = server;
        this.collection = database.collection('contact');
        this.service = new ContactService(this.collection, logger);
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
            this.logger.error("Failed to load contacts collection");
            return;
        }
        if (!this.service) {
            this.logger.error("Failed to load contacts service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            const addContactRoute = {
                method: 'POST',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                schema: {
                    body: UpdateContactValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.updateContact(request, reply)
            };
            const deleteContactRoute = {
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
                handler: (request, reply) => this.service.deleteContact(request, reply)
            };
            const getAllContactRoute = {
                method: 'GET',
                url: '/',
                config: {
                    rateLimit: {
                        max: 15,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                handler: (request, reply) => this.service.getContact(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addContactRoute);
                app.route(deleteContactRoute);
                app.route(getAllContactRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
