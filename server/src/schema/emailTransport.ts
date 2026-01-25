import mongoose, { Document, Model, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface EmailTransportDocument extends Document {
  _id: ObjectId;
  recipientCount: number;
  sentAt: Date;
  emailType: string;
}

// Interface for static methods
export interface EmailTransportModelInterface extends Model<EmailTransportDocument> {
  getRecipientCountInLast24Hours(): Promise<number>;
  canSendEmails(recipientCount: number, dailyLimit: number): Promise<boolean>;
  recordEmailSend(recipientCount: number, emailType?: string): Promise<EmailTransportDocument>;
  getUsageStats(dailyLimit: number): Promise<{
    currentCount: number;
    dailyLimit: number;
    remaining: number;
    percentageUsed: number;
  }>;
}

export const EmailTransportMongooseSchema = new Schema<EmailTransportDocument>(
  {
    recipientCount: {
      type: Number,
      required: [true, 'Recipient count is required'],
      min: 1
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    emailType: {
      type: String,
      default: 'general' // Can be 'booking', 'notification', etc.
    }
  },
  { timestamps: true }
);

// TTL index - auto-deletes after 24 hours
EmailTransportMongooseSchema.index({ sentAt: 1 }, { expireAfterSeconds: 86400 });

// Static method to get total recipients in the last 24 hours
EmailTransportMongooseSchema.statics.getRecipientCountInLast24Hours = async function () {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        sentAt: { $gte: twentyFourHoursAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalRecipients: { $sum: '$recipientCount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalRecipients : 0;
};

// Static method to check if we can send emails with given recipient count
EmailTransportMongooseSchema.statics.canSendEmails = async function (recipientCount: number, dailyLimit: number) {
  const currentCount = await (this as EmailTransportModelInterface).getRecipientCountInLast24Hours();
  return (currentCount + recipientCount) <= dailyLimit;
};

// Static method to record an email send
EmailTransportMongooseSchema.statics.recordEmailSend = async function (recipientCount: number, emailType: string = 'general') {
  return await this.create({
    recipientCount,
    sentAt: new Date(),
    emailType
  });
};

// Static method to get current usage stats
EmailTransportMongooseSchema.statics.getUsageStats = async function (dailyLimit: number) {
  const currentCount = await (this as EmailTransportModelInterface).getRecipientCountInLast24Hours();
  const remaining = Math.max(0, dailyLimit - currentCount);
  const percentageUsed = dailyLimit > 0 ? (currentCount / dailyLimit) * 100 : 0;

  return {
    currentCount,
    dailyLimit,
    remaining,
    percentageUsed: Math.round(percentageUsed * 100) / 100
  };
};

export const EmailTransportModel = mongoose.model<EmailTransportDocument, EmailTransportModelInterface>("EmailTransport", EmailTransportMongooseSchema);

