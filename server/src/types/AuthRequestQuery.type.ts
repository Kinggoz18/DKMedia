import { Type, Static } from "@sinclair/typebox";

export const AuthRequestQueryValidation = Type.Object({
  mode: Type.String(),
  id: Type.Optional(Type.String())
})

export const PassportRequestQueryValidation = Type.Object({
  state: Type.Optional(Type.String({
    mode: Type.String(),
    id: Type.Optional(Type.String())
  }))
})


export type AuthRequestQueryValidationType = Static<typeof AuthRequestQueryValidation>;
export type PassportRequestQueryValidationType = Static<typeof PassportRequestQueryValidation>;
