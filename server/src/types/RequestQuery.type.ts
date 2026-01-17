import { Type, Static } from "@sinclair/typebox";

export const RequestQueryValidation = Type.Object({
  id: Type.String()
})

export type RequestQueryValidationType = Static<typeof RequestQueryValidation>;
