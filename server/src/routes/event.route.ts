import IRoute from "../interfaces/IRoute.js";
import { EventDocument } from "../schema/events.js";
import { EventService } from "../services/events.service.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AddEventValidationSchema, AddEventValidationType, UpdateEventValidationSchema, UpdateEventValidationType } from "../types/event.type.js";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { CloudflareR2BucketManager } from "../services/CloudflareR2BucketManager.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class EventRoute implements IRoute<EventDocument> {
  service!: EventService;
  server: FastifyInstance;
  collection: mongodb.Collection<EventDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/events';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<EventDocument>('event');
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
      console.error("Error: Failed to load event collection")
      this.logger.error("Failed to load event collection");
      return;
    }

    // Initialize CloudflareR2BucketManager
    const r2BucketManager = new CloudflareR2BucketManager(logger);
    
    // Initialize service with R2BucketManager
    this.service = new EventService(this.collection, logger, r2BucketManager);

    if (!this.service) {
      console.error("Error: Failed to load event service")
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
      const addEventRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddEventValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddEventValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.addEvent(request, reply)
      }

      /**
       * Delete event route
       */
      const deleteEventRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteEvent(request, reply)
      }

      /**
       * Get all events route
       */
      const getAllEventsRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllEvents(request, reply)
      }

      /**
       * Get an event by Id route
       */
      const getEventByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getEventById(request, reply)
      }

      /**
       * Update an event route
       */
      const updateEventByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UpdateEventValidationType, Reply: IReplyType }> = {
        method: 'PUT',
        url: '/',
        schema: {
          body: UpdateEventValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.updateEventById(request, reply)
      }

      const uploadImageRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddEventValidationType }> = {
        method: 'POST',
        url: '/upload/image',
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.uploadImage(request, reply)
      }

      const uploadVideoRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddEventValidationType }> = {
        method: 'POST',
        url: '/upload/video',
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.uploadVideo(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addEventRoute)
        app.route(deleteEventRoute)
        app.route(getEventByIdRoute)
        app.route(getAllEventsRoute)
        app.route(updateEventByIdRoute)
        app.route(uploadImageRoute)
        app.route(uploadVideoRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}