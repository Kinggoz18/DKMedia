import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
import { AuthCodeDocument } from "../schema/authCode.js";
import { UserDocument } from "../schema/user.js";
import { mongodb } from "@fastify/mongodb";
import EmailService from "../services/EmailService.js";

export class EmailRoute {
  server: FastifyInstance;
  logger: FastifyBaseLogger;
  basePath: string = '/email';
  private protectMiddleware: ReturnType<typeof createProtectMiddleware>;
  private emailService: ReturnType<typeof EmailService>;

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.logger = logger;
    this.emailService = EmailService(logger);
    
    // Initialize middleware with injected collections
    const authCodeCollection = database.collection<AuthCodeDocument>('authcodes');
    const userCollection = database.collection<UserDocument>('auth');
    this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);

    if (!this.server) {
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.emailService) {
      this.logger.error("Failed to load email service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Get email usage stats route
       */
      const getEmailStatsRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'GET',
        url: '/stats',
        // Removed preHandler: this.protectMiddleware - GET route doesn't need protection
        handler: async (request, reply) => {
          try {
            const stats = await this.emailService.getUsageStats();
            
            reply.status(200).send({
              success: true,
              data: stats
            });
          } catch (error: any) {
            this.logger.error('Error getting email stats', error);
            reply.status(500).send({
              success: false,
              data: error.message || 'Failed to retrieve email stats'
            });
          }
        }
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(getEmailStatsRoute)
        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      this.logger.error({ error });
      return;
    }
  }
}

