import { mongodb, ObjectId } from "@fastify/mongodb";
import IService from "../interfaces/IService.js";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { NewsletterHistoryDocument, NewsletterHistoryModel } from "../schema/newsletterHistory.js";
import { AddNewsletterHistoryValidationType } from "../types/newsletterHistory.type.js";
import { IReplyType } from "../interfaces/IReply.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";

export class NewsletterHistoryService implements IService<NewsletterHistoryDocument> {
  dbModel = NewsletterHistoryModel;
  dbCollection: mongodb.Collection<NewsletterHistoryDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<NewsletterHistoryDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load newsletter history collection")
      return;
    }
  }

  /**
   * Add a newsletter history entry
   * @param request 
   * @param reply 
   * @returns 
   */
  addNewsletterHistory = async (request: FastifyRequest<{ Body: AddNewsletterHistoryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        subject,
        message,
        recipientsCount,
        status = 'sent',
        errorMessage,
      } = request.body;

      const newHistory = new this.dbModel({
        subject,
        message,
        recipientsCount,
        status,
        errorMessage,
        sentAt: new Date(),
      });

      await newHistory.validate();
      const savedHistory = await this.dbCollection.insertOne(newHistory);
      const getSavedHistory = await this.dbCollection.findOne({ _id: savedHistory?.insertedId });

      if (!getSavedHistory) {
        throw new ReplyError("Failed to save newsletter history", 400);
      }

      return reply.code(201).send({ data: getSavedHistory as any, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get newsletter history with pagination
   * @param request 
   * @param reply 
   * @returns 
   */
  getNewsletterHistory = async (request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) => {
    try {
      const page = parseInt(request.query.page || '1', 10);
      const limit = parseInt(request.query.limit || '20', 10);
      const skip = (page - 1) * limit;

      const [history, total] = await Promise.all([
        this.dbCollection.find({})
          .sort({ sentAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.dbCollection.countDocuments({})
      ]);

      return reply.code(200).send({ 
        success: true, 
        data: {
          history,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get a newsletter history by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getNewsletterHistoryById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const history = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!history) {
        throw new ReplyError("Newsletter history not found", 404);
      }

      return reply.code(200).send({ data: history as any, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}

