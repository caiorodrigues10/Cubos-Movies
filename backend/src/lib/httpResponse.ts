export type ApiResponse<T> = {
  result: "success" | "error";
  data: T | null;
  statusCode: number;
  message: string;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly data: unknown;

  constructor(message: string, statusCode = 400, data: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function buildSuccessResponse<T>(
  data: T,
  message = "Operação realizada com sucesso",
  statusCode = 200
): ApiResponse<T> {
  return {
    result: "success",
    data,
    statusCode,
    message,
  };
}

export function buildErrorResponse(params: {
  message: string;
  statusCode: number;
  data?: unknown;
}): ApiResponse<unknown> {
  const { message, statusCode, data = null } = params;
  return {
    result: "error",
    data,
    statusCode,
    message,
  };
}

