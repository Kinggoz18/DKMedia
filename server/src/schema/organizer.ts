import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";
export interface OrganizerDocument extends Document {
  _id: ObjectId,
  name: string;
  logo: string;
}

export const OrganizerMongooseSchema = new Schema<OrganizerDocument>({
  name: { type: String },
  logo: { type: String },
}, { timestamps: true });

export const OrganizerModel = mongoose.model("Organizer", OrganizerMongooseSchema);
