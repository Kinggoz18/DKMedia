import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { ContactUsDocument } from "../schema/contactUs.js";
import { ContactUsService } from "../services/contactUs.service.js";
import { AddContactUsValidationSchema, AddContactUsValidationType, ContactUsValidationSchema, ContactUsValidationType } from "../types/contactUs.type.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class ContactUsRoute implements IRoute<ContactUsDocument> {
  service: ContactUsService;
  server: FastifyInstance;
  collection: mongodb.Collection<ContactUsDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/contact-us';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ContactUsDocument>('contacts');
    this.service = new ContactUsService(this.collection, logger);
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
      console.error("Error: Failed to load contacts collection")
      this.logger.error("Failed to load contacts collection");
      return;
    }

    if (!this.service) {
      console.error("Error: Failed to load contacts service")
      this.logger.error("Failed to load contacts service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddContactUsValidationType, Reply: IReplyType }> = {
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
      }

      const deleteContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteContact(request, reply)
      }

      const getAllContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllContact(request, reply)
      }

      const getContactInquiryByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getContactInquiryById(request, reply)
      }

      const replyToInquiryRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { 
        Params: RequestQueryValidationType;
        Body: { subject: string; message: string; html?: string };
        Reply: IReplyType 
      }> = {
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
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addContactRoute)
        app.route(deleteContactRoute)
        app.route(getAllContactRoute)
        app.route(getContactInquiryByIdRoute)
        app.route(replyToInquiryRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}