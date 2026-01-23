import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService.js";
import { IReplyType } from "../interfaces/IReply.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { AddSubscriptionValidationType } from "../types/subscription.type.js";
import { SubscriptionDocument, SubscriptionModel } from "../schema/subscription.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import EmailServiceFactory from "./EmailService.js";
import { isValidEmail } from "../utils/validation.js";

export class SubscriptionService implements IService<SubscriptionDocument> {
  dbModel = SubscriptionModel;
  dbCollection: mongodb.Collection<SubscriptionDocument>;
  logger: FastifyBaseLogger;
  emailService!: ReturnType<typeof EmailServiceFactory>;

  constructor(dbCollection: mongodb.Collection<SubscriptionDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;
    this.emailService = EmailServiceFactory(logger);

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  /**
   * Add a new subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  addSubscription = async (request: FastifyRequest<{ Body: AddSubscriptionValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        firstName,
        lastName,
        email,
      } = request.body;

      // Validate email format
      if (!isValidEmail(email)) {
        throw new ReplyError("Invalid email address format", 400);
      }

      //Validate new subscription
      const newSubscription = new this.dbModel({
        firstName,
        lastName,
        email,
      });

      await newSubscription.validate();

      const isSubscribed = await this.dbCollection.findOne({email: email});
      if(isSubscribed) {
        request.log.error("Error: User is already subscribed to DKMEDIA newsletter")
        throw new ReplyError("Error: User is already subscribed to DKMEDIA newsletter", 400);
      }

      //Insert the new subscription
      const saveNewSubscription = await this.dbCollection.insertOne(newSubscription);
      const getNewSubscription = await this.dbCollection.findOne({ _id: saveNewSubscription?.insertedId });

      if (!getNewSubscription) {
        throw new ReplyError("Failed to save new subscription", 400);
      }

      return reply.code(201).send({ data: getNewSubscription, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete a subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  deleteSubscription = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const subscriptionToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) })

      if (subscriptionToDelete.deletedCount != 1) throw new ReplyError("Subscription not deleted", 404);

      return reply.code(200).send({ data: "Subscription deleted", success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get a subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  getSubscription = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const getSubscription = await this.dbCollection.findOne({ _id: new ObjectId(id) })

      if (!getSubscription) throw new ReplyError("Subscription not found", 404);

      return reply.code(200).send({ data: getSubscription, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllSubscription = async (request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) => {
    try {
      const page = parseInt(request.query.page || '1', 10);
      const limit = parseInt(request.query.limit || '20', 10);
      const skip = (page - 1) * limit;

      const [subscriptions, total] = await Promise.all([
        this.dbCollection.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.dbCollection.countDocuments({})
      ]);

      return reply.code(200).send({ 
        success: true, 
        data: {
          subscriptions,
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
   * Unsubscribe by email
   * @param request 
   * @param reply 
   * @returns 
   */
  unsubscribeByEmail = async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { email } = request.body;
      
      if (!email) {
        throw new ReplyError("Email is required", 400);
      }

      const subscription = await this.dbCollection.findOne({ email: email.toLowerCase().trim() });
      
      if (!subscription) {
        throw new ReplyError("Email not found in our subscription list", 404);
      }

      const deleteResult = await this.dbCollection.deleteOne({ _id: subscription._id });
      
      if (deleteResult.deletedCount !== 1) {
        throw new ReplyError("Failed to unsubscribe", 400);
      }

      this.logger.info(`User unsubscribed: ${email}`);
      return reply.code(200).send({ data: "Successfully unsubscribed from newsletter", success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else       return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all subscriber emails for bulk sending
   * @returns Array of email addresses
   */
  async getAllSubscriberEmails(): Promise<string[]> {
    try {
      const subscriptions = await this.dbCollection.find({}).toArray();
      return subscriptions.map(sub => sub.email).filter(Boolean);
    } catch (error: any) {
      this.logger.error('Error getting subscriber emails', error);
      throw error;
    }
  }

  /**
   * Send bulk newsletter to all subscribers
   * @param request 
   * @param reply 
   * @returns 
   */
  sendBulkNewsletter = async (
    request: FastifyRequest<{ Body: { subject: string; message: string; html?: string } }>,
    reply: FastifyReply<{ Reply: IReplyType }>
  ) => {
    try {
      const { subject, message, html } = request.body;

      if (!subject || !message) {
        throw new ReplyError("Subject and message are required", 400);
      }

      // Get all subscriber emails
      const recipientEmails = await this.getAllSubscriberEmails();

      if (recipientEmails.length === 0) {
        throw new ReplyError("No subscribers found", 404);
      }

      // Convert message to HTML if not provided
      const htmlContent = html || message.replace(/\n/g, '<br>');

      // Send bulk emails
      const result = await this.emailService.sendBulkEmail(
        recipientEmails,
        subject,
        htmlContent,
        message,
        'newsletter'
      );

      if (!result.success && result.sent === 0 && result.scheduled === 0) {
        throw new ReplyError("Failed to send newsletter", 400);
      }

      const responseMessage = result.scheduled > 0
        ? `${result.sent} emails sent, ${result.scheduled} scheduled for next day due to daily limit`
        : `${result.sent} emails sent successfully`;

      return reply.code(200).send({
        success: true,
        data: responseMessage
      });
    } catch (error: any) {
      request.log.error(error?.message);
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
    }
  }

  /**
   * Schedule bulk newsletter to be sent at a specific time
   * @param request 
   * @param reply 
   * @returns 
   */
  scheduleBulkNewsletter = async (
    request: FastifyRequest<{ Body: { subject: string; message: string; scheduledTime: string; html?: string } }>,
    reply: FastifyReply<{ Reply: IReplyType }>
  ) => {
    try {
      const { subject, message, scheduledTime, html } = request.body;

      if (!subject || !message || !scheduledTime) {
        throw new ReplyError("Subject, message, and scheduledTime are required", 400);
      }

      // Validate scheduled time is in the future
      const scheduleDate = new Date(scheduledTime);
      const now = new Date();
      if (scheduleDate <= now) {
        throw new ReplyError("Scheduled time must be in the future", 400);
      }

      // Get all subscriber emails
      const recipientEmails = await this.getAllSubscriberEmails();

      if (recipientEmails.length === 0) {
        throw new ReplyError("No subscribers found", 404);
      }

      // Convert message to HTML if not provided
      const htmlContent = html || message.replace(/\n/g, '<br>');

      // Schedule bulk emails
      const result = await this.emailService.scheduleBulkEmail(
        recipientEmails,
        subject,
        htmlContent,
        scheduleDate,
        message,
        'newsletter'
      );

      if (!result.success) {
        throw new ReplyError("Failed to schedule newsletter", 400);
      }

      const responseMessage = `${result.scheduled} emails scheduled for ${scheduleDate.toLocaleString()}`;

      return reply.code(200).send({
        success: true,
        data: responseMessage
      });
    } catch (error: any) {
      request.log.error(error?.message);
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" });
    }
  }
}