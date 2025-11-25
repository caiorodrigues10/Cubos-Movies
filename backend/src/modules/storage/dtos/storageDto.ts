import { Type, type Static } from "@sinclair/typebox";

export const PresignBodySchema = Type.Object(
  {
    fileName: Type.String({ minLength: 1 }),
    contentType: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const PresignResponseSchema = Type.Object({
  key: Type.String(),
  uploadUrl: Type.String({ format: "uri" }),
  objectUrl: Type.String({ format: "uri" }),
});

export type PresignBody = Static<typeof PresignBodySchema>;
export type PresignResponse = Static<typeof PresignResponseSchema>;

