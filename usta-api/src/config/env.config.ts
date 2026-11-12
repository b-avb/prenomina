import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INSTITUTIONAL_EMAIL_DOMAIN, type AuthMode } from '@usta/domain';

/**
 * Loads `.env` key-value pairs from the workspace or package root without overriding
 * variables already injected by the host process environment.
 */
function loadDotEnvIfPresent(): void {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'usta-api/.env'),
  ];
  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    try {
      const content = readFileSync(filePath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx <= 0) continue;
        const key = line.slice(0, eqIdx).trim();
        let value = line.slice(eqIdx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // Environment variables may be supplied directly by systemd or container runtimes without a readable local .env file.
    }
  }
}

loadDotEnvIfPresent();

/** MariaDB connection pool parameters. */
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly name: string;
  readonly user: string;
  readonly password: string;
  readonly poolLimit: number;
}

/** Authentication mode and Microsoft Entra ID (Azure AD) tenant parameters. */
export interface AuthEnvConfig {
  readonly mode: AuthMode;
  readonly azureTenantId: string;
  readonly azureClientId: string;
  readonly azureApiScope: string;
  readonly azureAudience: string;
  readonly institutionalDomain: string;
  readonly institutionalDomains: readonly string[];
  readonly msalCacheLocation: 'sessionStorage' | 'localStorage';
}

/** Resolved runtime configuration for the HTTP server, MariaDB pool, and authentication subsystem. */
export interface AppConfig {
  readonly port: number;
  readonly host: string;
  readonly nodeEnv: string;
  readonly corsOrigin: string;
  readonly trustProxy: boolean;
  readonly uploadsDir: string;
  readonly maxBodySizeBytes: number;
  readonly database: DatabaseConfig;
  readonly auth: AuthEnvConfig;
}

function readString(name: string, fallback: string): string {
  const value = process.env[name];
  return value !== undefined && value.trim() !== '' ? value.trim() : fallback;
}

function readFirstString(names: readonly string[], fallback = ''): string {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value.trim() !== '') {
      return value.trim();
    }
  }
  return fallback;
}

function readPositiveInt(name: string, fallback: number): number {
  const parsed = Number.parseInt(readString(name, String(fallback)), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const DEFAULT_INSTITUTIONAL_DOMAINS = [
  'ustatunja.edu.co',
  INSTITUTIONAL_EMAIL_DOMAIN,
  'usantoto.edu.co',
] as const;

/**
 * Resolves authentication settings across backend (`AZURE_*`, `ENTRA_*`, `MSAL_*`) and shared
 * frontend (`VITE_*`) variable aliases. Defaults to `'hybrid'` when Entra ID credentials are
 * present and `'local'` otherwise unless `AUTH_MODE` overrides it explicitly.
 */
export function resolveAuthEnvConfig(): AuthEnvConfig {
  const azureTenantId = readFirstString([
    'AZURE_TENANT_ID',
    'MSAL_TENANT_ID',
    'ENTRA_TENANT_ID',
    'VITE_AZURE_TENANT_ID',
  ]);
  const azureClientId = readFirstString([
    'AZURE_CLIENT_ID',
    'MSAL_CLIENT_ID',
    'ENTRA_CLIENT_ID',
    'VITE_AZURE_CLIENT_ID',
  ]);
  const azureApiScope = readFirstString([
    'AZURE_API_SCOPE',
    'MSAL_API_SCOPE',
    'ENTRA_API_SCOPE',
    'VITE_AZURE_API_SCOPE',
  ]);
  const azureAudience = readFirstString([
    'AZURE_AUDIENCE',
    'MSAL_AUDIENCE',
    'ENTRA_AUDIENCE',
  ]);
  const hasMicrosoftCredentials = Boolean(azureTenantId && azureClientId);

  const rawMode = readFirstString(['AUTH_MODE', 'VITE_AUTH_MODE']).toLowerCase();
  let mode: AuthMode;
  if (rawMode === 'microsoft' || rawMode === 'hybrid' || rawMode === 'local') {
    mode = rawMode;
  } else {
    mode = hasMicrosoftCredentials ? 'hybrid' : 'local';
  }

  const rawCache = readFirstString(['MSAL_CACHE_LOCATION', 'VITE_MSAL_CACHE_LOCATION'], 'sessionStorage');
  const msalCacheLocation: 'sessionStorage' | 'localStorage' =
    rawCache === 'localStorage' ? 'localStorage' : 'sessionStorage';

  const rawDomains = readFirstString(
    ['INSTITUTIONAL_EMAIL_DOMAINS', 'INSTITUTIONAL_EMAIL_DOMAIN'],
    DEFAULT_INSTITUTIONAL_DOMAINS.join(','),
  );
  const parsedDomains = Array.from(
    new Set(
      rawDomains
        .split(',')
        .map((d) => d.trim().toLowerCase().replace(/^@+/, ''))
        .filter(Boolean),
    ),
  );
  const institutionalDomains =
    parsedDomains.length > 0 ? parsedDomains : [...DEFAULT_INSTITUTIONAL_DOMAINS];

  return {
    mode,
    azureTenantId,
    azureClientId,
    azureApiScope,
    azureAudience,
    institutionalDomain: institutionalDomains[0] ?? 'ustatunja.edu.co',
    institutionalDomains,
    msalCacheLocation,
  };
}

/** Singleton process configuration evaluated at startup after optional `.env` hydration. */
export const ENV_CONFIG: AppConfig = {
  port: readPositiveInt('PORT', 4301),
  host: readString('HOST', '0.0.0.0'),
  nodeEnv: readString('NODE_ENV', 'development'),
  corsOrigin: readString('CORS_ORIGIN', '*'),
  trustProxy: readString('TRUST_PROXY', 'false').toLowerCase() === 'true',
  uploadsDir: resolve(
    process.cwd(),
    readString('UPLOADS_DIR', 'uploads'),
  ),
  // Sized above the 12 MB binary attachment limit to accommodate base64 JSON envelope overhead on Annex 3 uploads.
  maxBodySizeBytes: 25 * 1024 * 1024,
  database: {
    host: readString('DB_HOST', '127.0.0.1'),
    port: readPositiveInt('DB_PORT', 3307),
    name: readString('DB_NAME', 'usta_prenomina_tunja'),
    user: readString('DB_USER', 'usta_app'),
    password: readString('DB_PASSWORD', 'usta_app_local'),
    poolLimit: readPositiveInt('DB_POOL_LIMIT', 10),
  },
  auth: resolveAuthEnvConfig(),
};

/** Returns `true` when running under `NODE_ENV=development` (enables diagnostic error messages). */
export const isDevelopment = (config: AppConfig = ENV_CONFIG): boolean =>
  config.nodeEnv === 'development';
