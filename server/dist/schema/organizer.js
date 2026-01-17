import mongoose, { Schema } from "mongoose";
export const OrganizerMongooseSchema = new Schema({
    name: { type: String },
    logo: { type: String },
}, { timestamps: true });
export const OrganizerModel = mongoose.model("Organizer", OrganizerMongooseSchema);
