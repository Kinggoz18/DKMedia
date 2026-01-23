import { mongodb, ObjectId } from "@fastify/mongodb";
import IService from "../interfaces/IService.js";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import { IReplyType } from "../interfaces/IReply.js";
import { UploadedMediaDocument, UploadedMediaModel } from "../schema/uploadedMedia.js";
import { UploadedMediaValidationType } from "../types/uploadedMedia.type.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import { CloudflareR2BucketManager } from "./CloudflareR2BucketManager.js";

export class UploadedMediaService implements IService<UploadedMediaDocument> {
  dbModel = UploadedMediaModel;
  dbCollection: mongodb.Collection<UploadedMediaDocument>;
  logger: FastifyBaseLogger;
  r2BucketManager: CloudflareR2BucketManager;

  constructor(dbCollection: mongodb.Collection<UploadedMediaDocument>, logger: FastifyBaseLogger, r2BucketManager: CloudflareR2BucketManager) {
    this.dbCollection = dbCollection;
    this.logger = logger;
    this.r2BucketManager = r2BucketManager;

    if (!dbCollection) {
      logger.error("Failed to load uploaded media collection")
      return;
    }

    if (!r2BucketManager) {
      throw new Error("CloudflareR2BucketManager is missing");
    }
  }
  /**
   * Upload a new media
   * @param request 
   * @param reply 
   * @returns 
   */
  addMedia = async (request: FastifyRequest<{ Body: UploadedMediaValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        mediaType,
        mediaLink,
        eventTag,
        hashtags,
        caption,
      } = request.body;

      // Validate the uploaded media
      const media = new this.dbModel({
        mediaType,
        mediaLink,
        eventTag,
        hashtags: hashtags || [],
        caption: caption || "",
      });

      await media.validate();
      const savedMedia = await this.dbCollection.insertOne(media);

      const getSavedMedia = await this.dbCollection.findOne({ _id: savedMedia?.insertedId });
      if (!getSavedMedia) {
        throw new ReplyError("Failed to save media", 400);
      }

      return reply.code(201).send({ data: getSavedMedia, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete a media from the database
   * Also deletes the associated media file (image/video) from Cloudflare R2
   * @param request 
   * @param reply 
   * @returns 
   */
  deleteMedia = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      //Check if the media exists
      const mediaExists = await this.dbCollection.findOne({ _id: new ObjectId(id) })
      if (!mediaExists?._id) throw new ReplyError("Media does not exist", 404);

      // Delete the associated media file from R2 if it exists
      if (mediaExists.mediaLink) {
        try {
          await this.r2BucketManager.deleteSingleResource(mediaExists.mediaLink);
          this.logger.info(`Deleted media from R2: ${mediaExists.mediaLink}`);
        } catch (r2Error: any) {
          // Log the error but don't fail the deletion - the media might already be deleted
          this.logger.warn(`Failed to delete media from R2: ${r2Error?.message}`);
        }
      }

      //Delete the media from database
      const deleteResult = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (deleteResult.deletedCount != 1) {
        throw new ReplyError("Failed to delete media", 400);
      }
      return reply.code(200).send({ data: "deleted successfuly", success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get a media by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getMediaById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const media = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!media) {
        throw new ReplyError("Failed to get media", 400);
      }

      return reply.code(200).send({ data: media, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all media
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllMedia = async (request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) => {
    try {
      const page = parseInt(request.query.page || '1', 10);
      const limit = parseInt(request.query.limit || '20', 10);
      const skip = (page - 1) * limit;

      const [media, total] = await Promise.all([
        this.dbCollection.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.dbCollection.countDocuments({})
      ]);

      return reply.status(200).send({
        success: true,
        data: {
          media,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}