import { UserService } from "../services/user.service.js";
import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import fastifyPassport from '@fastify/passport';
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
/**
 * Auth route class. Used to create and register auth routes
 */
export class UserRoute {
    /**
     * Creates auth route instance
     * @param server The fastify server
     * @param database The MongoDb database
     */
    constructor(server, database, logger) {
        this.basePath = '/auth';
        this.server = server;
        this.logger = logger;
        this.collection = database.collection('auth');
        const authSessionCollection = database.collection('authSession');
        const authCodeCollection = database.collection('authcodes');
        this.service = new UserService(this.collection, logger, authSessionCollection, authCodeCollection);
        // Initialize middleware with injected collections
        this.protectMiddleware = createProtectMiddleware(authCodeCollection, this.collection);
        if (!this.server) {
            this.logger.error("Failed to load server");
            return;
        }
        if (!this.collection) {
            this.logger.error("Failed to load auth collection");
            return;
        }
        if (!this.service) {
            this.logger.error("Failed to load auth service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            const getUserRoute = {
                method: 'GET',
                url: `/:id`,
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema
                },
                handler: (request, reply) => this.service.getUser(request, reply)
            };
            const logoutUserRoute = {
                method: 'GET',
                url: `/`,
                handler: (request, reply) => this.service.logoutUser(request, reply)
            };
            const loginUserRoute = {
                method: 'GET',
                url: `/google/callback`,
                config: {
                    rateLimit: {
                        max: 5, //5 login attempts
                        timeWindow: 5 * 1000 * 60 //5 minutes 
                    }
                },
                preValidation: (request, reply) => {
                    const { id, mode } = request.query;
                    const googleAuthOptions = {
                        scope: [
                            "https://www.googleapis.com/auth/userinfo.profile",
                            "https://www.googleapis.com/auth/userinfo.email",
                        ],
                        state: JSON.stringify({ mode: request.query.mode, id: request.query.id }),
                        prompt: "select_account", // Add prompt here
                    }; // Type assertion
                    if (mode === "signup" && id) {
                        // Encrypt the signupCode before sending it in the state
                        return fastifyPassport.authenticate("google", googleAuthOptions).call(this.server, request, reply); // Use `.call(fastify, request, reply)` to ensure the correct context
                    }
                    else {
                        return fastifyPassport.authenticate("google", googleAuthOptions).call(this.server, request, reply); // Use `.call(fastify, request, reply)` to ensure the correct context
                    }
                },
                handler: (request, reply) => this.service.googleAuthHandler(request, reply)
            };
            const deleteUserRoute = {
                method: 'DELETE',
                url: '/',
                config: {
                    rateLimit: {
                        max: 5,
                        timeWindow: 5 * 1000 * 60 // 5 minutes
                    }
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteUser(request, reply)
            };
            const authenticateSignupCodeRoute = {
                method: 'POST',
                config: {
                    rateLimit: {
                        max: 5, //5 login attempts
                        timeWindow: 5 * 1000 * 60 //5 minutes 
                    }
                },
                url: `/authenticate-code`,
                handler: (request, reply) => this.service.authenticateSignupCode(request, reply)
            };
            const confirmAuthorizedUserRoute = {
                method: 'GET',
                url: `/confirm`,
                schema: {
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.confirmAuthorizedUser(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(logoutUserRoute);
                app.route(loginUserRoute);
                app.route(getUserRoute);
                app.route(deleteUserRoute);
                app.route(authenticateSignupCodeRoute);
                app.route(confirmAuthorizedUserRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            this.logger.error({ error });
            return;
        }
    }
}
