import { OrganizerMongooseSchema } from "./organizer.js";
import mongoose, { Document, Schema } from "mongoose";
import { EventPriority } from "../Enums/eventPriority.js";
import { OrganizerValidationType } from "../types/organizer.type.js";
import { ObjectId } from "@fastify/mongodb";


export interface EventDocument extends Document {
  _id: ObjectId,
  title: string;
  date: string;
  image: string;
  priority: EventPriority;
  organizer: OrganizerValidationType;
  ticketLink: string;
}

export const EventMongooseSchema = new Schema<EventDocument>({
  title: { type: String },
  date: { type: String },
  image: { type: String },
  priority: {
    type: String,
    required: true,
    enum: EventPriority,
  },
  organizer: OrganizerMongooseSchema,
  ticketLink: { type: String }
}, { timestamps: true });

// Export a schema for use as a nested schema (without _id and timestamps)
export const EventMongooseSubSchema = new Schema({
  title: { type: String },
  date: { type: String },
  image: { type: String },
  priority: {
    type: String,
    enum: EventPriority,
  },
  organizer: OrganizerMongooseSchema,
  ticketLink: { type: String }
}, { _id: false, timestamps: false });

export const EventModel = mongoose.model("Event", EventMongooseSchema) 