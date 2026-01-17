import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { ContactUsService } from "../services/contactUs.service.js";
import { AddContactUsValidationSchema } from "../types/contactUs.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class ContactUsRoute {
    constructor(server, database, logger) {
        this.basePath = '/contact-us';
        this.server = server;
        this.collection = database.collection('contacts');
        this.service = new ContactUsService(this.collection, logger);
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
            console.error("Error: Failed to load contacts collection");
            this.logger.error("Failed to load contacts collection");
            return;
        }
        if (!this.service) {
            console.error("Error: Failed to load contacts service");
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
                        max: 3, //3 inquiry attempts per user every 1 hour
                        timeWindow: 60 * 1000 * 60 //1 hour
                    }
                },
                schema: {
                    body: AddContactUsValidationSchema,
                    response: IReply.$schema,
                },
                handler: (request, reply) => this.service.addContact(request, reply)
            };
            const deleteContactRoute = {
                method: 'DELETE',
                url: '/:id',
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteContact(request, reply)
            };
            const getAllContactRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getAllContact(request, reply)
            };
            const getContactInquiryByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getContactInquiryById(request, reply)
            };
            const replyToInquiryRoute = {
                method: 'POST',
                url: '/:id/reply',
                schema: {
                    params: RequestQueryValidation,
                    body: {
                        type: 'object',
                        required: ['subject', 'message'],
                        properties: {
                            subject: { type: 'string' },
                            message: { type: 'string' },
                            html: { type: 'string' }
                        }
                    },
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.replyToInquiry(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addContactRoute);
                app.route(deleteContactRoute);
                app.route(getAllContactRoute);
                app.route(getContactInquiryByIdRoute);
                app.route(replyToInquiryRoute);
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
