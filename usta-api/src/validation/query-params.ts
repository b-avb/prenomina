import type { IncomingMessage } from 'node:http';
import { ACTOR_HEADERS } from '@usta/domain';
import { ValidationError } from '../utils/app-error.js';
import type { RouteParams } from '../utils/http.utils.js';

/** Reads a required route parameter (e.g. `:id`), enforcing non-empty content and an upper length bound. */
export function requirePathParam(
  params: RouteParams,
  name: string,
  options: { maxLength?: number } = {},
): string {
  const value = params[name]?.trim();
  const maxLength = options.maxLength ?? 128;
  if (!value) {
    throw new ValidationError([
      { field: `:${name}`, message: 'Parámetro de ruta requerido.' },
    ]);
  }
  if (value.length > maxLength) {
    throw new ValidationError([
      { field: `:${name}`, message: `Máximo ${maxLength} caracteres.` },
    ]);
  }
  return value;
}

/** Reads a required non-empty URL query parameter (`?name=...`), throwing `ValidationError` when missing. */
export function requireQueryParam(url: URL, name: string): string {
  const value = url.searchParams.get(name)?.trim();
  if (!value) {
    throw new ValidationError([
      { field: `?${name}`, message: 'Parámetro de consulta requerido.' },
    ]);
  }
  return value;
}

/**
 * Reads an optional trimmed URL query parameter. When `name === 'period'` and `?period=` is absent,
 * falls back to the URL-decoded `X-Payroll-Period` (`ACTOR_HEADERS.period`) request header.
 */
export function optionalQueryParam(
  url: URL,
  name: string,
  req?: IncomingMessage,
): string | undefined {
  const value = url.searchParams.get(name)?.trim();
  if (value) return value;
  if (name === 'period' && req) {
    const rawHeader = req.headers[ACTOR_HEADERS.period.toLowerCase()];
    const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (headerValue) {
      try {
        const decoded = decodeURIComponent(headerValue).trim();
        if (decoded) return decoded;
      } catch {
        const trimmed = headerValue.trim();
        if (trimmed) return trimmed;
      }
    }
  }
  return undefined;
}

/** Parses an optional integer query parameter constrained to the inclusive `[bounds.min, bounds.max]` range. */
export function optionalIntQueryParam(
  url: URL,
  name: string,
  bounds: { min: number; max: number },
): number | undefined {
  const raw = optionalQueryParam(url, name);
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < bounds.min || value > bounds.max) {
    throw new ValidationError([
      {
        field: `?${name}`,
        message: `Debe ser un entero entre ${bounds.min} y ${bounds.max}.`,
      },
    ]);
  }
  return value;
}
