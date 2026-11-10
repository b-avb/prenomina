import type { ApiErrorCode } from '@usta/domain';

/** Base class for every expected (non-programming) failure surfaced through the API. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ApiErrorCode, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

export interface FieldViolation {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(violations: FieldViolation[]) {
    super('La solicitud contiene campos inválidos.', 400, 'VALIDATION_FAILED', violations);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class PasswordChangeRequiredError extends AppError {
  constructor(
    message = 'Debes cambiar tu contraseña temporal antes de continuar utilizando la plataforma.',
  ) {
    super(message, 403, 'PASSWORD_CHANGE_REQUIRED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RouteNotFoundError extends AppError {
  constructor(method: string, path: string) {
    super(`Ruta no encontrada: ${method} ${path}`, 404, 'ROUTE_NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(limitBytes: number) {
    super(
      `El cuerpo de la solicitud supera el límite permitido (${Math.round(limitBytes / 1024 / 1024)} MB).`,
      413,
      'PAYLOAD_TOO_LARGE',
    );
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message = 'Demasiados intentos fallidos consecutivos. Por seguridad, espera unos minutos antes de volver a intentar.',
  ) {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}
