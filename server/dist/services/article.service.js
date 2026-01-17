import { ObjectId } from "@fastify/mongodb";
import { ReplyError } from "../interfaces/ReplyError.js";
import { ArticleModel } from "../schema/article.js";
export class ArticleService {
    constructor(dbCollection, logger) {
        this.dbModel = ArticleModel;
        /**
         * Add article  service
         * @param request
         * @param reply
         */
        this.addArticle = async (request, reply) => {
            try {
                const { title, link } = request.body;
                //Validate the request 
                const article = new this.dbModel({
                    title,
                    link
                });
                await article.validate();
                // Save the er article response
                const newArticle = await this.dbCollection.insertOne(article);
                const getNewArticle = await this.dbCollection.findOne({ _id: newArticle?.insertedId });
                if (!getNewArticle) {
                    this.logger.error('Failed to save article');
                    throw new ReplyError("Failed to save article", 400);
                }
                return reply.code(201).send({ data: getNewArticle, success: newArticle.acknowledged });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.deleteArticle = async (request, reply) => {
            try {
                const { id } = request.params;
                const articleToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
                if (articleToDelete.deletedCount != 1) {
                    this.logger.error('"Article not found');
                    throw new ReplyError("Article not found", 404);
                }
                return reply.status(200).send({ data: "Deleted successfuly", success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.getArticleById = async (request, reply) => {
            try {
                const { id } = request.params;
                const article = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!article) {
                    this.logger.error('"Article not found');
                    throw new ReplyError("Article not found", 404);
                }
                return reply.status(200).send({ data: article, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.getAllArticle = async (request, reply) => {
            try {
                const allArticles = await this.dbCollection.find({}).toArray();
                return reply.status(200).send({ data: allArticles, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.dbCollection = dbCollection;
        this.logger = logger;
        if (!dbCollection) {
            logger.error("Failed to load article collection");
            return;
        }
    }
}
