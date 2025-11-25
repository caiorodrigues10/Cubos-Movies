import { Type, type TSchema } from "@sinclair/typebox";

export const errorResponseSchema = Type.Object({
  result: Type.Literal("error"),
  data: Type.Optional(Type.Unknown()),
  statusCode: Type.Integer(),
  message: Type.String(),
});

export function successResponseSchema<T extends TSchema>(dataSchema: T) {
  return Type.Object({
    result: Type.Literal("success"),
    data: dataSchema,
    statusCode: Type.Integer(),
    message: Type.String(),
  });
}

