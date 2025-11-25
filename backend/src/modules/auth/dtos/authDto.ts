import { Type, type Static } from "@sinclair/typebox";

export const RegisterBodySchema = Type.Object(
  {
    name: Type.String({ minLength: 2 }),
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 6 }),
  },
  { additionalProperties: false }
);

export const LoginBodySchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const AuthPayloadSchema = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String({ format: "email" }),
  }),
});

export type RegisterBody = Static<typeof RegisterBodySchema>;
export type LoginBody = Static<typeof LoginBodySchema>;
export type AuthPayload = Static<typeof AuthPayloadSchema>;

