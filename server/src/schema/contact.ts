import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface ContactDocument extends Document {
  _id: ObjectId,
  email: string;
  instagramLink: string;
  tiktokLink: string;
}

export const ContactMongooseSchema = new Schema<ContactDocument>({
  email: { type: String },
  instagramLink: { type: String },
  tiktokLink: { type: String },
}, { timestamps: true });

export const ContactModel = mongoose.model("Contact", ContactMongooseSchema) 