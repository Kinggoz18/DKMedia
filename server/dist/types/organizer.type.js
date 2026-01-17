import { Type } from "@sinclair/typebox";
export const AddOrganizerValidationSchema = Type.Object({
    name: Type.String(),
    logo: Type.String(),
});
export const UpdateOrganizerValidationSchema = Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.String()),
    logo: Type.Optional(Type.String()),
});
export const OrganizerValidationSchema = Type.Object({
    _id: Type.Unknown(),
    name: Type.String(),
    logo: Type.String(),
});
