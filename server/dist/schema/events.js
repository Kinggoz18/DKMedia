import { OrganizerMongooseSchema } from "./organizer.js";
import mongoose, { Schema } from "mongoose";
import { EventPriority } from "../Enums/eventPriority.js";
export const EventMongooseSchema = new Schema({
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
export const EventModel = mongoose.model("Event", EventMongooseSchema);
