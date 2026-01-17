import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService.js";
import { IReplyType } from "../interfaces/IReply.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import { ContactDocument, ContactModel } from "../schema/contact.js";
import { UpdateContactValidationType } from "../types/contact.type.js";

export class ContactService implements IService<ContactDocument> {
  dbModel = ContactModel;
  dbCollection: mongodb.Collection<ContactDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<ContactDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  /**
   * Update contact service
   * @param request 
   * @param reply 
   */
  updateContact = async (request: FastifyRequest<{ Body: UpdateContactValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        email,
        instagramLink,
        tiktokLink,
      } = request.body;


      //Validate the request 
      const contact = new this.dbModel({
        email,
        instagramLink,
        tiktokLink,
      });

      await contact.validate();

      const currentContact = await this.dbCollection.findOne({});
      //If there is no contact
      if (!currentContact) {
        const updateContact = await this.dbCollection.insertOne(contact);
        const getSavedContact = await this.dbCollection.findOne({ _id: updateContact?.insertedId });

        if (!getSavedContact) {
          this.logger.error('Failed to save contact')
          throw new ReplyError("Failed to save contact", 400);
        }

        return reply.code(200).send({ data: getSavedContact, success: updateContact.acknowledged })
      } else {

        // Insert the new update
        const updateContact = await this.dbCollection.updateOne({ _id: currentContact?._id }, {
          $set: {
            email: email ?? currentContact.email,
            instagramLink: instagramLink ?? currentContact.instagramLink,
            tiktokLink: tiktokLink ?? currentContact.tiktokLink,
          }
        });

        if (!updateContact.acknowledged) {
          this.logger.error('Failed to update contact')
          throw new ReplyError("Failed to update contact", 400);
        }

        const getSavedContact = await this.dbCollection.findOne({ _id: currentContact?._id });

        if (!getSavedContact) {
          this.logger.error('Failed to get update contact')
          throw new ReplyError("Failed to get update contact", 400);
        }

        return reply.code(200).send({ data: getSavedContact, success: updateContact.acknowledged })
      }

    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete contact service
   * @param request 
   * @param reply 
   */
  deleteContact = async (request: FastifyRequest, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const contactToDelete = await this.dbCollection.deleteOne({});
      if (contactToDelete.deletedCount != 1) {
        this.logger.error('"Contact us inquiry not found')
        throw new ReplyError("Contact us inquiry not found", 404);
      }

      return reply.status(200).send({ data: "Deleted successfuly", success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get contact service
   * @param request 
   * @param reply 
   */
  getContact = async (request: FastifyRequest, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {

      const contact = await this.dbCollection.findOne({});

      if (!contact) {
        this.logger.error('"Contact us inquiry not found')
        throw new ReplyError("Contact us inquiry not found", 404);
      }
      return reply.status(200).send({ data: contact, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}