import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

const codeSchema = new Schema({
  code: { type: String },
  expiryDate: { type: Date }
});

export interface AuthCodeDocument extends Document {
  _id: ObjectId;
  userId: string;
  refreshToken: {
    code: string;
    expiryDate: Date;
  };
}

export const AuthCodeMongooseSchema = new Schema<AuthCodeDocument>(
  {
    userId: {
      type: String
    },
    //======={for verification}=============
    refreshToken: codeSchema
  },
  { timestamps: true }
);

export const AuthCodeModel = mongoose.model("AuthCodes", AuthCodeMongooseSchema);

