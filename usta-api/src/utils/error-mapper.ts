import type { ApiFailure } from '@usta/domain';
import { translateDatabaseError } from '../database/database-errors.js';
import { AppError } from './app-error.js';

export interface HttpFailure {
  statusCode: number;
  body: ApiFailure;
}

/**
 * Central error → HTTP mapping. Expected failures keep their status/code; anything
 * else is logged server-side and surfaced as a generic 500 without internals.
 */
export function mapErrorToHttpFailure(error: unknown): HttpFailure {
  const appError = error instanceof AppError ? error : translateDatabaseError(error);
  if (appError) {
    return {
      statusCode: appError.statusCode,
      body: {
        ok: false,
        code: appError.code,
        error: appError.message,
        ...(appError.details !== undefined ? { details: appError.details } : {}),
      },
    };
  }

  console.error('[USTA-API] Unhandled error:', error);
  return {
    statusCode: 500,
    body: { ok: false, code: 'INTERNAL_ERROR', error: 'Error interno del servidor.' },
  };
}
