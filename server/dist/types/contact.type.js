import { Type } from "@sinclair/typebox";
export const UpdateContactValidationSchema = Type.Object({
    email: Type.Optional(Type.String({ format: 'email' })),
    instagramLink: Type.Optional(Type.String()),
    tiktokLink: Type.Optional(Type.Optional(Type.String())),
});
export const ContactValidationSchema = Type.Object({
    _id: Type.Unknown(),
    email: Type.String({ format: 'email' }),
    instagramLink: Type.String(),
    tiktokLink: Type.Optional(Type.String()),
});
