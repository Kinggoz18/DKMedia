import { IReply } from "../interfaces/IReply.js";
import { RequestQueryValidation } from "../types/RequestQuery.type.js";
import { AddArticleValidationSchema } from "../types/article.type.js";
import { ArticleService } from "../services/article.service.js";
import { createProtectMiddleware } from "../middlewares/protectMiddleware.js";
export class ArticleRoute {
    constructor(server, database, logger) {
        this.basePath = '/articles';
        this.server = server;
        this.collection = database.collection('articles');
        this.service = new ArticleService(this.collection, logger);
        this.logger = logger;
        // Initialize middleware with injected collections
        const authCodeCollection = database.collection('authcodes');
        const userCollection = database.collection('auth');
        this.protectMiddleware = createProtectMiddleware(authCodeCollection, userCollection);
        if (!this.server) {
            console.error("Error: Failed to load server");
            this.logger.error("Failed to load server");
            return;
        }
        if (!this.collection) {
            console.error("Error: Failed to load articles collection");
            this.logger.error("Failed to load articles collection");
            return;
        }
        if (!this.service) {
            console.error("Error: Failed to load articles service");
            this.logger.error("Failed to load articles service");
            return;
        }
    }
    async initRoutes() {
        try {
            /******************************************* Route Declarations *******************************************/
            const addAtricleRoute = {
                method: 'POST',
                url: '/',
                schema: {
                    body: AddArticleValidationSchema,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.addArticle(request, reply)
            };
            const deleteArticleRoute = {
                method: 'DELETE',
                url: '/:id',
                schema: {
                    params: RequestQueryValidation,
                    response: IReply.$schema,
                },
                preHandler: this.protectMiddleware,
                handler: (request, reply) => this.service.deleteArticle(request, reply)
            };
            const getAllArticleRoute = {
                method: 'GET',
                url: '/',
                handler: (request, reply) => this.service.getAllArticle(request, reply)
            };
            const getArticleByIdRoute = {
                method: 'GET',
                url: '/:id',
                handler: (request, reply) => this.service.getArticleById(request, reply)
            };
            /******************************************* Register Routes *******************************************/
            await this.server.register(function (app, _, done) {
                app.route(addAtricleRoute);
                app.route(deleteArticleRoute);
                app.route(getAllArticleRoute);
                app.route(getArticleByIdRoute);
                done();
            }, { prefix: this.basePath });
        }
        catch (error) {
            console.error({ error });
            this.logger.error({ error });
            return;
        }
    }
}
