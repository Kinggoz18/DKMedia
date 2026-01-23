import { Static, Type } from "@sinclair/typebox";

export const AddNewsletterHistoryValidationSchema = Type.Object({
  _id: Type.Optional(Type.Any()),
  subject: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 }),
  recipientsCount: Type.Number({ minimum: 0 }),
  status: Type.Optional(Type.Union([Type.Literal('sent'), Type.Literal('failed')])),
  errorMessage: Type.Optional(Type.String()),
  expiresAt: Type.String({ format: 'date-time' }), // ISO 8601 date-time string
});

export const NewsletterHistoryPaginationSchema = Type.Object({
  page: Type.Number(),
  limit: Type.Number(),
  total: Type.Number(),
  totalPages: Type.Number(),
});

export const NewsletterHistoryResponseSchema = Type.Object({
  history: Type.Array(AddNewsletterHistoryValidationSchema),
  pagination: NewsletterHistoryPaginationSchema,
});

export type AddNewsletterHistoryValidationType = Static<typeof AddNewsletterHistoryValidationSchema>;
export type NewsletterHistoryPaginationType = Static<typeof NewsletterHistoryPaginationSchema>;
export type NewsletterHistoryResponseType = Static<typeof NewsletterHistoryResponseSchema>;

