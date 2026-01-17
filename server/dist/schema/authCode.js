import mongoose, { Schema } from "mongoose";
const codeSchema = new Schema({
    code: { type: String },
    expiryDate: { type: Date }
});
export const AuthCodeMongooseSchema = new Schema({
    userId: {
        type: String
    },
    //======={for verification}=============
    refreshToken: codeSchema
}, { timestamps: true });
export const AuthCodeModel = mongoose.model("AuthCodes", AuthCodeMongooseSchema);
