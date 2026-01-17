import { Static, Type } from "@sinclair/typebox";
import { EventValidationSchema } from "../types/event.type.js";
import { UserValidationSchema } from "../types/user.type.js";
import { AboutUsValidationSchema } from "../types/aboutUs.type.js";
import { ContactUsValidationSchema } from "../types/contactUs.type.js";
import { SubscriptionValidationSchema } from "../types/subscription.type.js";
import { OrganizerValidationSchema } from "../types/organizer.type.js";
import { UploadedMediaValidation } from "../types/uploadedMedia.type.js";
import { ContactValidationSchema } from "../types/contact.type.js";
import { ArticleValidationSchema } from "../types/article.type.js";
import { AddNewsletterHistoryValidationSchema, NewsletterHistoryResponseSchema } from "../types/newsletterHistory.type.js";
import { EmailUsageStatsValidationSchema } from "../types/emailStats.type.js";

/**
 * IReply object used for request replies.
 */
export const IReply = Type.Object({
  '2xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation, ContactValidationSchema, ArticleValidationSchema, AddNewsletterHistoryValidationSchema, NewsletterHistoryResponseSchema, EmailUsageStatsValidationSchema])
  }),

  '4xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation, ContactValidationSchema, ArticleValidationSchema, AddNewsletterHistoryValidationSchema, NewsletterHistoryResponseSchema, EmailUsageStatsValidationSchema])
  }),

  500: Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation, ContactValidationSchema, ArticleValidationSchema, AddNewsletterHistoryValidationSchema, NewsletterHistoryResponseSchema, EmailUsageStatsValidationSchema])
  }),
});

/**
 * IReply type used
 */
export type IReplyType = Static<typeof IReply>
