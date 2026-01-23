import { ObjectId } from "@fastify/mongodb";
import { NewsletterHistoryModel } from "../schema/newsletterHistory.js";
import { ReplyError } from "../interfaces/ReplyError.js";
export class NewsletterHistoryService {
    constructor(dbCollection, logger) {
        this.dbModel = NewsletterHistoryModel;
        /**
         * Add a newsletter history entry
         * @param request
         * @param reply
         * @returns
         */
        this.addNewsletterHistory = async (request, reply) => {
            try {
                const { subject, message, recipientsCount, status = 'sent', errorMessage, expiresAt, } = request.body;
                // Validate expiresAt is a valid date
                const expiresAtDate = new Date(expiresAt);
                if (isNaN(expiresAtDate.getTime())) {
                    throw new ReplyError("Invalid expiresAt date format", 400);
                }
                const newHistory = new this.dbModel({
                    subject,
                    message,
                    recipientsCount,
                    status,
                    errorMessage,
                    sentAt: new Date(),
                    expiresAt: expiresAtDate,
                });
                await newHistory.validate();
                const savedHistory = await this.dbCollection.insertOne(newHistory);
                const getSavedHistory = await this.dbCollection.findOne({ _id: savedHistory?.insertedId });
                if (!getSavedHistory) {
                    throw new ReplyError("Failed to save newsletter history", 400);
                }
                return reply.code(201).send({ data: getSavedHistory, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        /**
         * Get newsletter history with pagination
         * @param request
         * @param reply
         * @returns
         */
        this.getNewsletterHistory = async (request, reply) => {
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
                });
            }
            catch (error) {
                request.log.error(error?.message);
                return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        /**
         * Get a newsletter history by id
         * @param request
         * @param reply
         * @returns
         */
        this.getNewsletterHistoryById = async (request, reply) => {
            try {
                const { id } = request.params;
                const history = await this.dbCollection.findOne({ _id: new ObjectId(id) });
                if (!history) {
                    throw new ReplyError("Newsletter history not found", 404);
                }
                return reply.code(200).send({ data: history, success: true });
            }
            catch (error) {
                request.log.error(error?.message);
                if (error instanceof ReplyError)
                    return reply.status(error.code).send({ success: false, data: error.message });
                else
                    return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
            }
        };
        this.dbCollection = dbCollection;
        this.logger = logger;
        if (!dbCollection) {
            logger.error("Failed to load newsletter history collection");
            return;
        }
    }
}
