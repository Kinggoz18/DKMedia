import mongoose, { Schema } from "mongoose";
export const ScheduledEmailMongooseSchema = new Schema({
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
}, { timestamps: true });
// Index for efficient queries on scheduledTime and status
ScheduledEmailMongooseSchema.index({ scheduledTime: 1, status: 1 });
// Static method to get pending emails scheduled for now or earlier
ScheduledEmailMongooseSchema.statics.getPendingEmails = async function (limit = 10) {
    const now = new Date();
    return await this.find({
        status: 'pending',
        scheduledTime: { $lte: now }
    })
        .sort({ scheduledTime: 1 })
        .limit(limit);
};
// Static method to mark email as processing
ScheduledEmailMongooseSchema.statics.markAsProcessing = async function (emailId) {
    return await this.findByIdAndUpdate(emailId, {
        status: 'processing',
        lastAttemptAt: new Date(),
        $inc: { attempts: 1 }
    }, { new: true });
};
// Static method to mark email as sent
ScheduledEmailMongooseSchema.statics.markAsSent = async function (emailId) {
    return await this.findByIdAndUpdate(emailId, {
        status: 'sent'
    }, { new: true });
};
// Static method to mark email as failed and reschedule if needed
ScheduledEmailMongooseSchema.statics.markAsFailed = async function (emailId, error, rescheduleFor) {
    const update = {
        status: rescheduleFor ? 'pending' : 'failed',
        error: error
    };
    if (rescheduleFor) {
        update.scheduledTime = rescheduleFor;
    }
    return await this.findByIdAndUpdate(emailId, update, { new: true });
};
export const ScheduledEmailModel = mongoose.model("ScheduledEmail", ScheduledEmailMongooseSchema);
