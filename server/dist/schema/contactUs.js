import mongoose, { Schema } from "mongoose";
export const ContactUsMongooseSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    subject: { type: String },
    company: { type: String },
    email: { type: String },
    phone: { type: String, default: undefined },
    message: { type: String },
}, { timestamps: true });
export const ContactUsModel = mongoose.model("ContactUs", ContactUsMongooseSchema);
