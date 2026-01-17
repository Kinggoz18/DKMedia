import mongoose, { Schema } from "mongoose";
export const AboutUsMongooseSchema = new Schema({
    title: { type: String },
    paragraphs: { type: [String], default: [] },
});
export const AboutUsModel = mongoose.model("AboutUs", AboutUsMongooseSchema);
