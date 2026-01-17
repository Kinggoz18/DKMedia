import { Type } from "@sinclair/typebox";
export const UserDevice = Type.Object({
    client: Type.Object({
        name: Type.String(),
        type: Type.String(),
        version: Type.String(),
    }),
    os: Type.Object({
        name: Type.String(),
        version: Type.String(),
        platform: Type.String(),
    }),
    device: Type.Object({
        type: Type.String(),
        brand: Type.String(),
        model: Type.String(),
    }),
    userAgent: Type.String(),
});
export const AuthToken = Type.Object({
    code: Type.String(),
    expiryDate: Type.Date(),
});
export const UserAuth = Type.Object({
    deviceId: Type.String(),
    userId: Type.String(),
    devices: UserDevice,
    refreshToken: AuthToken,
    atExpiresAt: Type.Date(),
    rtExpiresAt: Type.Date(),
});
export const AuthCallbackValidationSchema = Type.Object({
    userId: Type.String(),
    mode: Type.String(),
    erroMessage: Type.Optional(Type.String())
});
