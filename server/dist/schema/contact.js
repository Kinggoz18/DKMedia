import mongoose, { Schema } from "mongoose";
export const ContactMongooseSchema = new Schema({
    email: { type: String },
    instagramLink: { type: String },
    tiktokLink: { type: String },
}, { timestamps: true });
export const ContactModel = mongoose.model("Contact", ContactMongooseSchema);
