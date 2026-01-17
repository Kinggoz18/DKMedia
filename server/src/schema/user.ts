import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface UserDocument extends Document {
  _id: ObjectId,
  authId: string;
  displayName: string;
  email: string;
}

export interface AuthSessionDocument extends Document {
  _id: ObjectId,
  expires: Date;
}

export const UserMongooseSchema = new Schema<UserDocument>({
  authId: { type: String },
  displayName: { type: String },
  email: { type: String },
})

export const AuthSession = new Schema<AuthSessionDocument>({
  expires: { type: Date },
})

export const UserModel = mongoose.model("Auth", UserMongooseSchema);
export const AuthSessionModel = mongoose.model("AuthSession", AuthSession);