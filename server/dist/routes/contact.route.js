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
                schema: {
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteContact(request, reply)
            };
            const getAllContactRoute = {
                method: 'GET',
                url: '/',
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
            console.error({ error });
            this.logger.error({ error });
            return;
        }
    }
}
