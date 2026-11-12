import type { ApiErrorCode, ApiFailure, ApiSuccess } from '@usta/domain';

/** Failures detected by the client itself (no server envelope available). */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'UNEXPECTED_ERROR';

/** Structured HTTP or transport failure normalized from `usta-api` error envelopes or `fetch` exceptions. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode | ClientErrorCode,
    message: string,
    public readonly endpoint: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type QueryParams = Readonly<Record<string, string | number | boolean | undefined>>;

/** Supplies headers that must accompany every request (e.g. the acting user). */
export type DefaultHeadersProvider = () => Readonly<Record<string, string>>;
export type UnauthorizedHandler = (error: ApiError) => void;

export interface HttpClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiSuccess<T>(body: unknown): body is ApiSuccess<T> {
  return isRecord(body) && body.ok === true && 'data' in body;
}

function isApiFailure(body: unknown): body is ApiFailure {
  return isRecord(body) && body.ok === false && typeof body.error === 'string';
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/**
 * Typed JSON and binary HTTP client for `usta-api`.
 *
 * Architectural behaviors:
 * - Deduplicates `/api` prefixes when joining `baseUrl` and endpoint paths.
 * - Dispatches standard RESTful HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with per-request `AbortController` timeouts.
 * - Invokes the registered `401` handler on expired sessions while excluding unauthenticated login endpoints.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private defaultHeadersProvider: DefaultHeadersProvider = () => ({});
  private unauthorizedHandler: UnauthorizedHandler | null = null;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? 15000;
  }

  public setDefaultHeadersProvider(provider: DefaultHeadersProvider): void {
    this.defaultHeadersProvider = provider;
  }

  public setUnauthorizedHandler(handler: UnauthorizedHandler): void {
    this.unauthorizedHandler = handler;
  }

  private resolveEndpoint(path: string, query?: QueryParams): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const base =
      this.baseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')
        ? `${this.baseUrl}${normalizedPath.slice(4)}`
        : `${this.baseUrl}${normalizedPath}`;
    if (!query) return base;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const search = params.toString();
    return search ? `${base}?${search}` : base;
  }

  private async request<T>(
    method: string,
    path: string,
    options: { query?: QueryParams; body?: unknown } = {},
  ): Promise<T> {
    const normalizedMethod = method.toUpperCase();
    const endpoint = this.resolveEndpoint(path, options.query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const hasBody = options.body !== undefined;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: normalizedMethod,
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
          ...this.defaultHeadersProvider(),
        },
        body: hasBody ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ApiError(0, 'TIMEOUT', 'El servidor tardó demasiado en responder. Intente de nuevo.', endpoint);
      }
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'No se pudo conectar con el servidor.',
        endpoint,
        error,
      );
    } finally {
      clearTimeout(timer);
    }

    const body = await readJson(response);

    if (!response.ok) {
      const apiError = isApiFailure(body)
        ? new ApiError(response.status, body.code, body.error, endpoint, body.details)
        : new ApiError(
            response.status,
            'INVALID_RESPONSE',
            'No se pudo completar la solicitud.',
            endpoint,
          );
      const isPublicAuthAttempt =
        path.endsWith('/auth/login') ||
        path.endsWith('/auth/microsoft') ||
        path.endsWith('/auth/change-password');
      if (response.status === 401 && !isPublicAuthAttempt && this.unauthorizedHandler) {
        this.unauthorizedHandler(apiError);
      }
      throw apiError;
    }

    if (!isApiSuccess<T>(body)) {
      throw new ApiError(
        response.status,
        'INVALID_RESPONSE',
        'El servidor devolvió una respuesta no válida.',
        endpoint,
      );
    }
    return body.data;
  }

  public get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  public post<T>(path: string, body: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('POST', path, { body, query });
  }

  public put<T>(path: string, body: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('PUT', path, { body, query });
  }

  public patch<T>(path: string, body: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>('PATCH', path, { body, query });
  }

  public delete<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>('DELETE', path, { query });
  }

  /** Downloads an authenticated binary attachment (e.g. Annex 3 support PDF) with timeout and 401 handling. */
  public async fetchBlob(path: string, query?: QueryParams): Promise<Blob> {
    const endpoint = this.resolveEndpoint(path, query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          ...this.defaultHeadersProvider(),
        },
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ApiError(
          0,
          'TIMEOUT',
          'La descarga tardó demasiado. Intente de nuevo.',
          endpoint,
        );
      }
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'No se pudo descargar el documento adjunto.',
        endpoint,
        error,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const body = await readJson(response);
      const apiError = isApiFailure(body)
        ? new ApiError(response.status, body.code, body.error, endpoint, body.details)
        : new ApiError(
            response.status,
            'INVALID_RESPONSE',
            'No se pudo abrir el archivo adjunto.',
            endpoint,
          );
      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler(apiError);
      }
      throw apiError;
    }

    return response.blob();
  }
}

/** Detects deployment mount subpath (`/app/prenomina/`, `/prenomina/`, or `/`) from `window.location`. */
export function detectAppBasePath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname === '/app/prenomina' || pathname.startsWith('/app/prenomina/')) {
    return '/app/prenomina/';
  }
  if (pathname === '/prenomina' || pathname.startsWith('/prenomina/')) {
    return '/prenomina/';
  }
  return '/';
}

/** Prefixes static public asset paths with the active deployment subpath. */
export function resolvePublicAssetUrl(relativePath: string): string {
  const cleanRelative = relativePath.replace(/^\/+/, '');
  return `${detectAppBasePath()}${cleanRelative}`;
}

/** Resolves the API base URL from `VITE_API_URL`, local dev port `4301`, or the mounted subpath `/api`. */
function resolveApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return 'http://localhost:4301/api';
  const basePath = detectAppBasePath();
  return `${basePath.replace(/\/+$/, '')}/api`;
}

export const API_BASE_URL: string = resolveApiBaseUrl();

export const apiClient = new HttpClient({ baseUrl: API_BASE_URL });
