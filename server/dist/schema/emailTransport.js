import mongoose, { Schema } from "mongoose";
export const EmailTransportMongooseSchema = new Schema({
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
}, { timestamps: true });
// Index for efficient queries on sentAt (for 24-hour rolling window)
// Note: MongoDB TTL indexes will auto-delete after 24 hours
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
EmailTransportMongooseSchema.statics.canSendEmails = async function (recipientCount, dailyLimit) {
    const currentCount = await this.getRecipientCountInLast24Hours();
    return (currentCount + recipientCount) <= dailyLimit;
};
// Static method to record an email send
EmailTransportMongooseSchema.statics.recordEmailSend = async function (recipientCount, emailType = 'general') {
    return await this.create({
        recipientCount,
        sentAt: new Date(),
        emailType
    });
};
// Static method to get current usage stats
EmailTransportMongooseSchema.statics.getUsageStats = async function (dailyLimit) {
    const currentCount = await this.getRecipientCountInLast24Hours();
    const remaining = Math.max(0, dailyLimit - currentCount);
    const percentageUsed = dailyLimit > 0 ? (currentCount / dailyLimit) * 100 : 0;
    return {
        currentCount,
        dailyLimit,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100
    };
};
export const EmailTransportModel = mongoose.model("EmailTransport", EmailTransportMongooseSchema);
