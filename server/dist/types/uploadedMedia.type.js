import { Type } from "@sinclair/typebox";
import { mediaType } from "../Enums/mediaType.js";
export const UploadedMediaValidation = Type.Object({
    mediaType: Type.Enum(mediaType),
    mediaLink: Type.String({ format: 'uri' }),
    eventTag: Type.Optional(Type.Unknown()),
    hashtags: Type.Optional(Type.Array(Type.String())),
    caption: Type.Optional(Type.String())
});
