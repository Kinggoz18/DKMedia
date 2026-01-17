import mongoose, { Schema } from "mongoose";
export const NewsletterHistoryMongooseSchema = new Schema({
    subject: { type: String, required: true },
    message: { type: String, required: true },
    recipientsCount: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    errorMessage: { type: String, required: false },
}, { timestamps: true });
export const NewsletterHistoryModel = mongoose.model("NewsletterHistory", NewsletterHistoryMongooseSchema);
