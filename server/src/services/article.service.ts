import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService.js";
import { AddArticleValidationType } from "../types/article.type.js";
import { IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import { ArticleDocument, ArticleModel } from "../schema/article.js";

export class ArticleService implements IService<ArticleDocument> {
  dbModel = ArticleModel;
  dbCollection: mongodb.Collection<ArticleDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<ArticleDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load article collection")
      return;
    }
  }

  /**
   * Add article  service
   * @param request 
   * @param reply 
   */
  addArticle = async (request: FastifyRequest<{ Body: AddArticleValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        title,
        link
      } = request.body;

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
        this.logger.error('Failed to save article')
        throw new ReplyError("Failed to save article", 400);
      }

      return reply.code(201).send({ data: getNewArticle, success: newArticle.acknowledged })

    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  deleteArticle = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const articleToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (articleToDelete.deletedCount != 1) {
        this.logger.error('"Article not found')
        throw new ReplyError("Article not found", 404);
      }

      return reply.status(200).send({ data: "Deleted successfuly", success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  getArticleById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const article = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!article) {
        this.logger.error('"Article not found')
        throw new ReplyError("Article not found", 404);
      }
      return reply.status(200).send({ data: article, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  getAllArticle = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allArticles = await this.dbCollection.find({}).toArray();
      return reply.status(200).send({ data: allArticles, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}