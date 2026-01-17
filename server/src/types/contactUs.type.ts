import { Static, Type } from "@sinclair/typebox";

export const AddContactUsValidationSchema = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  subject: Type.String(),
  company: Type.Optional(Type.String()),
  email: Type.String({ format: 'email' }),
  phone: Type.Optional(Type.String()),
  message: Type.String(),
})

export const ContactUsValidationSchema = Type.Object({
  _id: Type.Unknown(),
  firstName: Type.String(),
  lastName: Type.String(),
  subject: Type.String(),
  company: Type.Optional(Type.String()),
  email: Type.String({ format: 'email' }),
  phone: Type.Optional(Type.String()),
  message: Type.String(),
})

export type ContactUsValidationType = Static<typeof ContactUsValidationSchema>
export type AddContactUsValidationType = Static<typeof AddContactUsValidationSchema>