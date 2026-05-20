export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function badRequest(message: string, code = "bad_request") {
  return new AppError(400, code, message);
}

export function notFound(message: string, code = "not_found") {
  return new AppError(404, code, message);
}

export function serviceUnavailable(message: string, code = "service_unavailable") {
  return new AppError(503, code, message);
}
