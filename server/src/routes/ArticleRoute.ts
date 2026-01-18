import IRoute from "../interfaces/IRoute.js";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { AddArticleValidationSchema, AddArticleValidationType } from "../types/article.type.js";
import { ArticleDocument } from "../schema/article.js";
import { ArticleService } from "../services/article.service.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";

export class ArticleRoute implements IRoute<ArticleDocument> {
  service: ArticleService;
  server: FastifyInstance;
  collection: mongodb.Collection<ArticleDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/articles';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ArticleDocument>('articles');
    this.service = new ArticleService(this.collection, logger);
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
      this.logger.error("Failed to load articles collection");
      return;
    }

    if (!this.service) {
      this.logger.error("Failed to load articles service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addAtricleRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddArticleValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddArticleValidationSchema,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.addArticle(request, reply)
      }

      const deleteArticleRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        preHandler: this.protectMiddleware,
        handler: (request, reply) => this.service.deleteArticle(request, reply)
      }

      const getAllArticleRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllArticle(request, reply)
      }

      const getArticleByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getArticleById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addAtricleRoute)
        app.route(deleteArticleRoute)
        app.route(getAllArticleRoute)
        app.route(getArticleByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}