import mongoose, { Document } from "mongoose";
import { mediaType } from "../Enums/mediaType.js";
import { ObjectId } from "@fastify/mongodb";
import { EventValidationType } from "../types/event.type.js";
import { EventMongooseSubSchema } from "./events.js";


export interface UploadedMediaDocument extends Document {
  _id: ObjectId,
  mediaType: mediaType;
  mediaLink: string;
  eventTag?: EventValidationType;
  hashtags?: string[];
  caption?: string;
}

export const UploadedMediaMongooseSchema = new mongoose.Schema<UploadedMediaDocument>({
  mediaType: {
    type: String,
    enum: mediaType,
    required: true
  },
  mediaLink: {
    type: String,
    Required: true,
  },
  eventTag: { type: EventMongooseSubSchema, required: false },
  hashtags: {
    type: [String],
    default: [],
    required: false
  },
  caption: {
    type: String,
    required: false,
    default: ""
  }
}, { timestamps: true })

export const UploadedMediaModel = mongoose.model('UploadedMedia', UploadedMediaMongooseSchema);
