import mongoose, { Schema } from "mongoose";
export const UserMongooseSchema = new Schema({
    authId: { type: String },
    displayName: { type: String },
    email: { type: String },
});
export const AuthSession = new Schema({
    expires: { type: Date },
});
export const UserModel = mongoose.model("Auth", UserMongooseSchema);
export const AuthSessionModel = mongoose.model("AuthSession", AuthSession);
