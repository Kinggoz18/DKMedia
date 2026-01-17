import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface SubscriptionDocument extends Document {
  _id: ObjectId,
  firstName: string;
  lastName: string;
  email: string;
}

export const SubscriptionMongooseSchema = new Schema<SubscriptionDocument>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true },
}, { timestamps: true });

export const SubscriptionModel = mongoose.model("Subscription", SubscriptionMongooseSchema) 