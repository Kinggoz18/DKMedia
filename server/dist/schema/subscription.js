import mongoose, { Schema } from "mongoose";
export const SubscriptionMongooseSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
}, { timestamps: true });
export const SubscriptionModel = mongoose.model("Subscription", SubscriptionMongooseSchema);
