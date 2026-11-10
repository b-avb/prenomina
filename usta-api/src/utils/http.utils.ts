import type { IncomingMessage, ServerResponse } from 'node:http';
import { ACTOR_HEADERS, type ApiFailure, type ApiSuccess } from '@usta/domain';
import { ENV_CONFIG } from '../config/env.config.js';
import { BadRequestError, PayloadTooLargeError } from './app-error.js';

export type RouteParams = Readonly<Record<string, string>>;

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  params: RouteParams,
) => Promise<void>;

export function buildCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ENV_CONFIG.corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': [
      'Content-Type',
      'Authorization',
      ACTOR_HEADERS.name,
      ACTOR_HEADERS.role,
      ACTOR_HEADERS.period,
    ].join(', '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

function writeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...buildCorsHeaders(),
  });
  res.end(JSON.stringify(payload));
}

export function sendSuccess<T>(res: ServerResponse, statusCode: number, data: T): void {
  const body: ApiSuccess<T> = { ok: true, data };
  writeJson(res, statusCode, body);
}

export function sendFailure(res: ServerResponse, statusCode: number, failure: ApiFailure): void {
  writeJson(res, statusCode, failure);
}

export function sendNoContent(res: ServerResponse): void {
  res.writeHead(204, buildCorsHeaders());
  res.end();
}

/** Reads and parses the JSON request body, enforcing the configured size limit. */
export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const limit = ENV_CONFIG.maxBodySizeBytes;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let rejected = false;
    req.on('data', (chunk: Buffer) => {
      if (rejected) return;
      size += chunk.length;
      if (size > limit) {
        rejected = true;
        reject(new PayloadTooLargeError(limit));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (rejected) return;
      const raw = Buffer.concat(chunks).toString('utf-8');
      try {
        resolve(raw ? (JSON.parse(raw) as unknown) : {});
      } catch {
        reject(new BadRequestError('El cuerpo de la solicitud no es un JSON válido.'));
      }
    });
    req.on('error', reject);
  });
}
