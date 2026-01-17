import mongoose from "mongoose";
import { mediaType } from "../Enums/mediaType.js";
import { EventMongooseSubSchema } from "./events.js";
export const UploadedMediaMongooseSchema = new mongoose.Schema({
    mediaType: {
        type: String,
        enum: mediaType,
        required: true
    },
    mediaLink: {
        type: String,
        Required: true,
    },
    eventTag: { type: EventMongooseSubSchema, required: false },
    hashtags: {
        type: [String],
        default: [],
        required: false
    },
    caption: {
        type: String,
        required: false,
        default: ""
    }
}, { timestamps: true });
export const UploadedMediaModel = mongoose.model('UploadedMedia', UploadedMediaMongooseSchema);
