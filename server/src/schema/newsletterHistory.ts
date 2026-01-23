import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface NewsletterHistoryDocument extends Document {
  _id: ObjectId,
  subject: string;
  message: string;
  recipientsCount: number;
  sentAt: Date;
  status: 'sent' | 'failed';
  errorMessage?: string;
  expiresAt: Date;
}

export const NewsletterHistoryMongooseSchema = new Schema<NewsletterHistoryDocument>({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  recipientsCount: { type: Number, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  errorMessage: { type: String, required: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export const NewsletterHistoryModel = mongoose.model("NewsletterHistory", NewsletterHistoryMongooseSchema)

