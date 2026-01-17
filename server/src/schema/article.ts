import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";


export interface ArticleDocument extends Document {
  _id: ObjectId,
  title: string;
  link: string;
}

export const ArticleMongooseSchema = new Schema<ArticleDocument>({
  title: { type: String },
  link: { type: String },
});

export const ArticleModel = mongoose.model("Article", ArticleMongooseSchema) 