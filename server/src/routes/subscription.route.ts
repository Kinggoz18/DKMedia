import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { AddSubscriptionValidationSchema, AddSubscriptionValidationType } from "../types/subscription.type.js";
import { SubscriptionService } from "../services/Subscription.service.js";
import { SubscriptionDocument } from "../schema/subscription.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class SubscriptionRoute implements IRoute<SubscriptionDocument> {
  service: SubscriptionService;
  server: FastifyInstance;
  collection: mongodb.Collection<SubscriptionDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/subscriptions';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<SubscriptionDocument>('subscription');
    this.service = new SubscriptionService(this.collection, logger);
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
      console.error("Error: Failed to load subscription collection")
      this.logger.error("Failed to load subscription collection");
      return;
    }

    if (!this.service) {
      console.error("Error: Failed to load subscription service")
      this.logger.error("Failed to load subscription service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Add subscription route
       */
      const addSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddSubscriptionValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        config: {
          rateLimit: {
            max: 2, //2 Subscription attempt per every 1 hour
            timeWindow: 60 * 1000 * 60 //1 hour
          }
        },
        schema: {
          body: AddSubscriptionValidationSchema,
          response: IReply.$schema,
        },
        // Note: This is a public endpoint (subscription from public site), not protected
        handler: (request, reply) => this.service.addSubscription(request, reply)
      }

      /**
       * Delete subscription route
       */
      const deleteSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteSubscription(request, reply)
      }

      /**
       * Get all subscription route
       */
      const getAllSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { page?: string; limit?: string } }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllSubscription(request, reply)
      }

      /**
      * Get subscription route
      */
      const getSubscriptionByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getSubscription(request, reply)
      }

      /**
       * Unsubscribe by email route
       */
      const unsubscribeByEmailRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: { email: string }, Reply: IReplyType }> = {
        method: 'POST',
        url: '/unsubscribe',
        config: {
          rateLimit: {
            max: 5, // 5 attempts per hour
            timeWindow: 60 * 1000 * 60 // 1 hour
          }
        },
        handler: (request, reply) => this.service.unsubscribeByEmail(request, reply)
      }

      /**
       * Send bulk newsletter route
       */
      const sendBulkNewsletterRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: { subject: string; message: string; html?: string }, Reply: IReplyType }> = {
        method: 'POST',
        url: '/send-newsletter',
        schema: {
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
        handler: (request, reply) => this.service.sendBulkNewsletter(request, reply)
      }

      /**
       * Schedule bulk newsletter route
       */
      const scheduleBulkNewsletterRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: { subject: string; message: string; scheduledTime: string; html?: string }, Reply: IReplyType }> = {
        method: 'POST',
        url: '/schedule-newsletter',
        schema: {
          body: {
            type: 'object',
            required: ['subject', 'message', 'scheduledTime'],
            properties: {
              subject: { type: 'string' },
              message: { type: 'string' },
              scheduledTime: { type: 'string' },
              html: { type: 'string' }
            }
          },
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.scheduleBulkNewsletter(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addSubscriptionRoute)
        app.route(deleteSubscriptionRoute)
        app.route(getAllSubscriptionRoute)
        app.route(getSubscriptionByIdRoute)
        app.route(unsubscribeByEmailRoute)
        app.route(sendBulkNewsletterRoute)
        app.route(scheduleBulkNewsletterRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}