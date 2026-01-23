import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { ContactDocument } from "../schema/contact.js";
import { ContactService } from "../services/contact.service.js";
import { UpdateContactValidationSchema, UpdateContactValidationType } from "../types/contact.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class ContactRoute implements IRoute<ContactDocument> {
  service: ContactService;
  server: FastifyInstance;
  collection: mongodb.Collection<ContactDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/contact';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ContactDocument>('contact');
    this.service = new ContactService(this.collection, logger);
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
      const addContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UpdateContactValidationType, Reply: IReplyType }> = {
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
      }

      const deleteContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
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
      }

      const getAllContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'GET',
        url: '/',
        config: {
          rateLimit: {
            max: 15,
            timeWindow: 5 * 1000 * 60 // 5 minutes
          }
        },
        handler: (request, reply) => this.service.getContact(request, reply)
      }


      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addContactRoute)
        app.route(deleteContactRoute)
        app.route(getAllContactRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}