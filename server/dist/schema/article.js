import mongoose, { Schema } from "mongoose";
export const ArticleMongooseSchema = new Schema({
    title: { type: String },
    link: { type: String },
});
export const ArticleModel = mongoose.model("Article", ArticleMongooseSchema);
