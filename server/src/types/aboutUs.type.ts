import { Static, Type } from "@sinclair/typebox";

export const AddAboutUsValidation = Type.Object({
  title: Type.Optional(Type.String()),
  paragraphs: Type.Optional(Type.Array(Type.String())),
})

export const AboutUsValidationSchema = Type.Object({
  _id: Type.Unknown(),
  title: Type.String(),
  paragraphs: Type.Array(Type.String()),
})

export type AboutUsValidationType = Static<typeof AboutUsValidationSchema>
export type AddAboutUsValidationType = Static<typeof AddAboutUsValidation>
