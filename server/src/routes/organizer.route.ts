import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { OrganizerService } from "../services/organizer.service.js";
import { OrganizerDocument } from "../schema/organizer.js";
import { AddOrganizerValidationSchema, AddOrganizerValidationType, UpdateOrganizerValidationSchema, UpdateOrganizerValidationType } from "../types/organizer.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class OrganizerRoute implements IRoute<OrganizerDocument> {
  service!: OrganizerService;
  server: FastifyInstance;
  collection: mongodb.Collection<OrganizerDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/organizers';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<OrganizerDocument>('organizer');
    this.logger = logger;
    
    // Initialize middleware with injected collections
    const authCodeCollection = database.collection<AuthCodeDocument>('authcodes');
    const userCollection = database.collection<UserDocument>('auth');
    this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);

    if (!this.server) {
      console.error("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.error("Error: Failed to load organizer collection")
      this.logger.error("Failed to load organizer collection");
      return;
    }

    // Initialize CloudflareR2BucketManager
    const r2BucketManager = new CloudflareR2BucketManager(logger);
    
    // Initialize service with R2BucketManager
    this.service = new OrganizerService(this.collection, logger, r2BucketManager);

    if (!this.service) {
      console.error("Error: Failed to load organizer service")
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
      const addOrganizerRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddOrganizerValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddOrganizerValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.addOrganizer(request, reply)
      }

      /**
      * Delete an organizer route
      */
      const deleteOrganizerRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteOrganizer(request, reply)
      }

      /**
      * Get all organizer route
      */
      const getAllOrganizersRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllOrganizer(request, reply)
      }

      /**
      * Get an organizer route
      */
      const getOrganizerByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getOrganizerById(request, reply)
      }

      /**
      * Update an organizer route
      */
      const updateOrganizerByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UpdateOrganizerValidationType, Reply: IReplyType }> = {
        method: 'PUT',
        url: '/',
        schema: {
          body: UpdateOrganizerValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.updateOrganizer(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addOrganizerRoute)
        app.route(deleteOrganizerRoute)
        app.route(getOrganizerByIdRoute)
        app.route(getAllOrganizersRoute)
        app.route(updateOrganizerByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}