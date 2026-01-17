import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface ContactUsDocument extends Document {
  _id: ObjectId,
  firstName: string;
  subject: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactUsMongooseSchema = new Schema<ContactUsDocument>({
  firstName: { type: String },
  lastName: { type: String },
  subject: { type: String },
  company: { type: String },
  email: { type: String },
  phone: { type: String, default: undefined },
  message: { type: String },
}, { timestamps: true });

export const ContactUsModel = mongoose.model("ContactUs", ContactUsMongooseSchema) 