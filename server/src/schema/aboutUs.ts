import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";


export interface AboutUsDocument extends Document {
  _id: ObjectId,
  title: string;
  paragraphs: string[];
}

export const AboutUsMongooseSchema = new Schema<AboutUsDocument>({
  title: { type: String },
  paragraphs: { type: [String], default: [] },
});

export const AboutUsModel = mongoose.model("AboutUs", AboutUsMongooseSchema) 