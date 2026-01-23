import mongoose, { Document, Model, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface ScheduledEmailDocument extends Document {
  _id: ObjectId;
  mailOptions: {
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
  };
  emailType: string;
  scheduledTime: Date;
  attempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  lastAttemptAt?: Date;
  error?: string;
  expiresAt?: Date;
}

// Interface for static methods
export interface ScheduledEmailModelInterface extends Model<ScheduledEmailDocument> {
  getPendingEmails(limit?: number): Promise<ScheduledEmailDocument[]>;
  markAsProcessing(emailId: ObjectId): Promise<ScheduledEmailDocument | null>;
  markAsSent(emailId: ObjectId): Promise<ScheduledEmailDocument | null>;
  markAsFailed(emailId: ObjectId, error: string, rescheduleFor?: Date): Promise<ScheduledEmailDocument | null>;
}

export const ScheduledEmailMongooseSchema = new Schema<ScheduledEmailDocument>(
  {
    mailOptions: {
      type: Schema.Types.Mixed,
      required: true
    },
    emailType: {
      type: String,
      required: true,
      default: 'general'
    },
    scheduledTime: {
      type: Date,
      required: true,
      index: true // Index for efficient querying by scheduled time
    },
    attempts: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed'],
      default: 'pending',
      index: true
    },
    lastAttemptAt: {
      type: Date
    },
    error: {
      type: String
    },
    expiresAt: {
      type: Date,
      required: false,
      index: true // Index for efficient querying by expiration
    }
  },
  { timestamps: true }
);

// Index for efficient queries on scheduledTime and status
ScheduledEmailMongooseSchema.index({ scheduledTime: 1, status: 1 });

// Static method to get pending emails scheduled for now or earlier
ScheduledEmailMongooseSchema.statics.getPendingEmails = async function (limit: number = 10) {
  const now = new Date();
  
  return await this.find({
    status: 'pending',
    scheduledTime: { $lte: now }
  })
    .sort({ scheduledTime: 1 })
    .limit(limit);
};

// Static method to mark email as processing
ScheduledEmailMongooseSchema.statics.markAsProcessing = async function (emailId: ObjectId) {
  return await this.findByIdAndUpdate(
    emailId,
    {
      status: 'processing',
      lastAttemptAt: new Date(),
      $inc: { attempts: 1 }
    },
    { new: true }
  );
};

// Static method to mark email as sent
ScheduledEmailMongooseSchema.statics.markAsSent = async function (emailId: ObjectId) {
  return await this.findByIdAndUpdate(
    emailId,
    {
      status: 'sent'
    },
    { new: true }
  );
};

// Static method to mark email as failed and reschedule if needed
ScheduledEmailMongooseSchema.statics.markAsFailed = async function (
  emailId: ObjectId,
  error: string,
  rescheduleFor?: Date
) {
  const update: any = {
    status: rescheduleFor ? 'pending' : 'failed',
    error: error
  };
  
  if (rescheduleFor) {
    update.scheduledTime = rescheduleFor;
  }
  
  return await this.findByIdAndUpdate(
    emailId,
    update,
    { new: true }
  );
};

export const ScheduledEmailModel = mongoose.model<ScheduledEmailDocument, ScheduledEmailModelInterface>("ScheduledEmail", ScheduledEmailMongooseSchema);

