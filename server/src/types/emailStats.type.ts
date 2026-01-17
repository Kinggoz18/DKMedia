import { Static, Type } from "@sinclair/typebox";

export const EmailUsageStatsValidationSchema = Type.Object({
  currentCount: Type.Number(),
  dailyLimit: Type.Number(),
  remaining: Type.Number(),
  percentageUsed: Type.Number(),
});

export type EmailUsageStatsValidationType = Static<typeof EmailUsageStatsValidationSchema>;

