import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { AboutUsDocument } from "../schema/aboutUs.js";
import { AboutUsService } from "../services/aboutUs.service.js";
import { AddAboutUsValidation, AddAboutUsValidationType } from "../types/aboutUs.type.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class AboutUsRoute implements IRoute<AboutUsDocument> {
  service: AboutUsService;
  server: FastifyInstance;
  collection: mongodb.Collection<AboutUsDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/about-us';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<AboutUsDocument>('about');
    this.service = new AboutUsService(this.collection, logger);
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
      this.logger.error("Failed to load about us collection");
      return;
    }

    if (!this.service) {
      this.logger.error("Failed to load about us service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Update about us section route
       */
      const updateAboutUsRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddAboutUsValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddAboutUsValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.updateAboutUs(request, reply)
      }

      /**
       * Delete about us section route
       */
      const deleteAboutUsRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/',
        schema: {
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteAboutUs(request, reply)
      }

      /**
       * Get about us section route
       */
      const getAboutUs: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAboutUs(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(updateAboutUsRoute)
        app.route(deleteAboutUsRoute)
        app.route(getAboutUs);

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}