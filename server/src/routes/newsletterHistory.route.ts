import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { NewsletterHistoryService } from "../services/newsletterHistory.service.js";
import { NewsletterHistoryDocument } from "../schema/newsletterHistory.js";
import { AddNewsletterHistoryValidationSchema, AddNewsletterHistoryValidationType } from "../types/newsletterHistory.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class NewsletterHistoryRoute implements IRoute<NewsletterHistoryDocument> {
  service: NewsletterHistoryService;
  server: FastifyInstance;
  collection: mongodb.Collection<NewsletterHistoryDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/newsletter-history';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<NewsletterHistoryDocument>('newsletter_history');
    this.service = new NewsletterHistoryService(this.collection, logger);
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
      this.logger.error("Failed to load newsletter history collection");
      return;
    }

    if (!this.service) {
      this.logger.error("Failed to load newsletter history service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Add newsletter history route
       */
      const addNewsletterHistoryRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddNewsletterHistoryValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        config: {
          rateLimit: {
            max: 5,
            timeWindow: 5 * 1000 * 60 // 5 minutes
          }
        },
        schema: {
          body: AddNewsletterHistoryValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.addNewsletterHistory(request, reply)
      }

      /**
       * Get newsletter history with pagination route
       */
      const getNewsletterHistoryRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: { page?: string; limit?: string } }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getNewsletterHistory(request, reply)
      }

      /**
       * Get newsletter history by id route
       */
      const getNewsletterHistoryByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getNewsletterHistoryById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addNewsletterHistoryRoute)
        app.route(getNewsletterHistoryRoute)
        app.route(getNewsletterHistoryByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}

