import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { UploadedMediaService } from "../services/uploadedMedia.service.js";
import { UploadedMediaValidation } from "../types/uploadedMedia.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
//TODO: Test media tag
export class UploadMediaRoute {
    constructor(server, database, logger) {
        this.basePath = '/upload-media';
        this.server = server;
        this.collection = database.collection('uploaded_media');
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
            console.error("Error: Failed to load uploaded media collection");
            this.logger.error("Failed to load uploaded media collection");
            return;
        }
        // Initialize CloudflareR2BucketManager
        const r2BucketManager = new CloudflareR2BucketManager(logger);
        // Initialize service with R2BucketManager
        this.service = new UploadedMediaService(this.collection, logger, r2BucketManager);
        if (!this.service) {
            console.error("Error: Failed to load uploaded media service");
            this.logger.error("Failed to load uploaded media service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            /**
             * Add a media route
             */
            const addMedia = {
                method: 'POST',
                url: '/',
                schema: {
                    body: UploadedMediaValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.addMedia(request, reply)
            };
            /**
             * Delete a media route
             */
            const deleteMedia = {
                method: 'DELETE',
                url: '/:id',
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteMedia(request, reply)
            };
            /**
             * Get all Media route
             */
            const getAllMediaRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getAllMedia(request, reply)
            };
            /**
             * Get a media by id route
             */
            const getMediaByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getMediaById(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addMedia);
                app.route(deleteMedia);
                app.route(getAllMediaRoute);
                app.route(getMediaByIdRoute);
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
