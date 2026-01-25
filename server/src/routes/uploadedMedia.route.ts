import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { UploadedMediaService } from "../services/uploadedMedia.service.js";
import { UploadedMediaDocument } from "../schema/uploadedMedia.js";
import { UploadedMediaValidation, UploadedMediaValidationType } from "../types/uploadedMedia.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class UploadMediaRoute implements IRoute<UploadedMediaDocument> {
  service!: UploadedMediaService;
  server: FastifyInstance;
  collection: mongodb.Collection<UploadedMediaDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/upload-media';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<UploadedMediaDocument>('uploaded_media');
    this.logger = logger;
    
    // Initialize middleware with injected collections
    const authCodeCollection = database.collection<AuthCodeDocument>('authcodes');
    const userCollection = database.collection<UserDocument>('auth');
    this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);

    if (!this.server) {
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      this.logger.error("Failed to load uploaded media collection");
      return;
    }

    // Initialize CloudflareR2BucketManager
    const r2BucketManager = new CloudflareR2BucketManager(logger);
    
    // Initialize service with R2BucketManager
    this.service = new UploadedMediaService(this.collection, logger, r2BucketManager);

    if (!this.service) {
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
      const addMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UploadedMediaValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        config: {
          rateLimit: {
            max: 5,
            timeWindow: 5 * 1000 * 60 // 5 minutes
          }
        },
        schema: {
          body: UploadedMediaValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.addMedia(request, reply)
      }

      /**
       * Delete a media route
       */
      const deleteMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
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
        handler: (request, reply) => this.service.deleteMedia(request, reply)
      }

      /**
       * Get all Media route
       */
      const getAllMediaRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { page?: string; limit?: string } }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllMedia(request, reply)
      }

      /**
       * Get a media by id route
       */
      const getMediaByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getMediaById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addMedia)
        app.route(deleteMedia)
        app.route(getAllMediaRoute)
        app.route(getMediaByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}