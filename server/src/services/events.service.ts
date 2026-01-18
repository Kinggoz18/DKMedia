import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService.js";
import { IReplyType } from "../interfaces/IReply.js";
import { EventDocument, EventModel } from "../schema/events.js";
import { AddEventValidationType, UpdateEventValidationType } from "../types/event.type.js";
import { mongodb, ObjectId } from "@fastify/mongodb";
import { ReplyError } from "../interfaces/ReplyError.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { CloudflareR2BucketManager } from "./CloudflareR2BucketManager.js";
import { EventPriority } from "../Enums/eventPriority.js";

export class EventService implements IService<EventDocument> {
  dbModel = EventModel;
  dbCollection: mongodb.Collection<EventDocument>;
  logger: FastifyBaseLogger;
  r2BucketManager: CloudflareR2BucketManager;

  constructor(
    dbCollection: mongodb.Collection<EventDocument>, 
    logger: FastifyBaseLogger,
    r2BucketManager: CloudflareR2BucketManager
  ) {
    this.dbCollection = dbCollection;
    this.logger = logger;
    this.r2BucketManager = r2BucketManager;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }

    if (!r2BucketManager) {
      throw new Error("CloudflareR2BucketManager is missing");
    }
  }

  /**
   * Post an event to the database
   * TODO: Test the maximum highlights logic
   * @param request 
   * @param reply 
   * @returns 
   */
  addEvent = async (request: FastifyRequest<{ Body: AddEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        title,
        date,
        image,
        priority,
        organizer,
        ticketLink
      } = request.body;

      //Check if the maximum highlights has been added
      if (priority === EventPriority.Highlight) {
        const currentDateTime = new Date().toISOString().slice(0, 16);
        const allHighlights = await this.dbCollection.find({
          priority: EventPriority.Highlight,
          date: { $gte: currentDateTime } // Filters events that are in the future
        }).toArray();
        if (allHighlights.length >= 4) {
          throw new ReplyError("Maximum of 4 highlights can be added. Please delete a previous highlight before adding a new one", 400);
        }
      }

      //MongoDb Validation step
      const newEvent = new this.dbModel({
        title,
        date,
        image,
        priority,
        organizer,
        ticketLink
      })
      await newEvent.validate();

      //Save the data to mongodb
      const saveEvent = await this.dbCollection.insertOne(newEvent);
      const getSavedEvent = await this.dbCollection.findOne({ _id: saveEvent?.insertedId });

      if (!getSavedEvent) {
        this.logger.error('Failed to add event')
        throw new ReplyError('Failed to add event', 400);
      }

      return reply.code(201).send({ data: getSavedEvent, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete an event from the database
   * Also deletes the associated image from Cloudflare R2
   * @param request 
   * @param reply 
   */
  deleteEvent = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      //Check if the event exists
      const eventExists = await this.dbCollection.findOne({ _id: new ObjectId(id) })
      if (!eventExists?._id) throw new ReplyError("Event does not exists", 404);

      // Delete the associated image from R2 if it exists
      if (eventExists.image) {
        try {
          await this.r2BucketManager.deleteSingleResource(eventExists.image);
          this.logger.info(`Deleted image from R2: ${eventExists.image}`);
        } catch (r2Error: any) {
          // Log the error but don't fail the deletion - the image might already be deleted
          this.logger.warn(`Failed to delete image from R2: ${r2Error?.message}`);
        }
      }

      //Delete the event from database
      const deleteResult = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (!deleteResult.acknowledged) throw new ReplyError("Failed to delete event", 400);

      return reply.code(200).send({ success: deleteResult.acknowledged, data: "Event and associated media deleted" })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all events
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllEvents = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allEvents = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ success: true, data: allEvents })
    } catch (error: any) {
      request.log.error(error?.message)
      reply.code(400).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get an event by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getEventById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      return reply.status(200).send({ success: true, data: event })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Update an event id
   * @param request 
   * @param reply 
   * @returns 
   */
  updateEventById = async (request: FastifyRequest<{ Body: UpdateEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        id,
        title,
        date,
        image,
        priority,
        organizer, ticketLink } = request.body;

      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });
      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      const updateResult = await this.dbCollection.updateOne({ _id: event?._id }, {
        $set: {
          title: title ?? event.title,
          date: date ?? event.date,
          image: image ?? event.image,
          priority: priority ?? event.priority,
          organizer: organizer ?? event.organizer,
          ticketLink: ticketLink ?? event.ticketLink,
        }
      });

      if (!updateResult.acknowledged) {
        throw new ReplyError("Failed to update event", 400);
      }

      const updatedEvent = await this.dbCollection.findOne({ _id: event?._id });

      if (!updatedEvent) {
        throw new ReplyError("Failed to get updated event", 404);
      }

      return reply.status(200).send({ success: true, data: updatedEvent })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }


  /**
   * Handle uploads for images
   */
  uploadImage = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ success: false, data: 'No file uploaded' });
    }

    try {
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Upload to Cloudflare R2
      const secureUrl = await this.r2BucketManager.uploadImage(buffer);

      return reply.code(200).send({ success: true, data: secureUrl });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Image upload failed" })
    }
  }

  /**
   * Handle uploads for videos
   */
  uploadVideo = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ success: false, data: 'No file uploaded' });
    }

    try {
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Upload to Cloudflare R2
      const secureUrl = await this.r2BucketManager.uploadVideo(buffer);

      return reply.code(200).send({ success: true, data: secureUrl });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Video upload failed" })
    }
  }

}