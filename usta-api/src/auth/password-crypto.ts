import '../config/env.config.js';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { AuthUser, PayrollRole } from '@usta/domain';
import { isOneOf, PAYROLL_ROLES } from '../validation/domain-enums.js';

const SCRYPT_KEYLEN = 64;
const DEFAULT_TOKEN_TTL_SECONDS = 12 * 60 * 60; // 12 hours
const JWT_ISSUER = 'usta-tunja-prenomina-api';
const DEV_FALLBACK_SECRET = 'usta-tunja-prenomina-dev-only-secret-key';

const JWT_HEADER_B64 = Buffer.from(
  JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  'utf8',
).toString('base64url');

function resolveTokenSecret(): string {
  const configured =
    process.env.AUTH_TOKEN_SECRET?.trim() || process.env.AUTH_JWT_SECRET?.trim() || '';
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[USTA-API-TS] Configuración crítica faltante: AUTH_TOKEN_SECRET es obligatorio en producción.',
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function assertProductionAuthSecret(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const configured =
    process.env.AUTH_TOKEN_SECRET?.trim() || process.env.AUTH_JWT_SECRET?.trim() || '';
  if (!configured || configured === DEV_FALLBACK_SECRET || configured.length < 32) {
    throw new Error(
      '[USTA-API-TS] Configuración insegura: AUTH_TOKEN_SECRET debe tener al menos 32 caracteres aleatorios en producción.',
    );
  }
}

export interface AuthTokenClaims {
  iss: string;
  sub: string;
  username: string;
  fullName: string;
  role: PayrollRole;
  unitId: string | null;
  mustChangePassword: boolean;
  pwdChangedAt: string | null;
  iat: number;
  exp: number;
}

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plainPassword, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const actualBuf = scryptSync(plainPassword, salt, expectedBuf.length);
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

export function signAuthToken(
  user: Pick<
    AuthUser,
    | 'id'
    | 'username'
    | 'fullName'
    | 'role'
    | 'unitId'
    | 'mustChangePassword'
    | 'passwordChangedAt'
  >,
  ttlSeconds = DEFAULT_TOKEN_TTL_SECONDS,
): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const claims: AuthTokenClaims = {
    iss: JWT_ISSUER,
    sub: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    unitId: user.unitId,
    mustChangePassword: user.mustChangePassword,
    pwdChangedAt: user.passwordChangedAt ?? null,
    iat: nowSec,
    exp: nowSec + ttlSeconds,
  };
  const payloadB64 = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url');
  const signingInput = `${JWT_HEADER_B64}.${payloadB64}`;
  const sigB64 = createHmac('sha256', resolveTokenSecret())
    .update(signingInput)
    .digest('base64url');
  return `${signingInput}.${sigB64}`;
}

function validateParsedClaims(raw: unknown): AuthTokenClaims | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const nowSec = Math.floor(Date.now() / 1000);

  if (obj.iss !== JWT_ISSUER) return null;
  if (typeof obj.sub !== 'string' || !obj.sub) return null;
  if (typeof obj.username !== 'string' || !obj.username) return null;
  if (typeof obj.fullName !== 'string' || !obj.fullName) return null;
  if (!isOneOf(obj.role, PAYROLL_ROLES)) return null;
  if (obj.unitId !== null && typeof obj.unitId !== 'string') return null;
  if (typeof obj.mustChangePassword !== 'boolean') return null;
  if (typeof obj.exp !== 'number' || obj.exp < nowSec) return null;

  return {
    iss: JWT_ISSUER,
    sub: obj.sub,
    username: obj.username,
    fullName: obj.fullName,
    role: obj.role,
    unitId: obj.unitId,
    mustChangePassword: obj.mustChangePassword,
    pwdChangedAt: typeof obj.pwdChangedAt === 'string' ? obj.pwdChangedAt : null,
    iat: typeof obj.iat === 'number' ? obj.iat : nowSec,
    exp: obj.exp,
  };
}

export function verifyAuthToken(token: string): AuthTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const [headerB64, payloadB64, sigB64] = parts;
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const headerJson = JSON.parse(
      Buffer.from(headerB64, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    if (headerJson.alg !== 'HS256') return null;

    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSig = createHmac('sha256', resolveTokenSecret())
      .update(signingInput)
      .digest();
    const actualSig = Buffer.from(sigB64, 'base64url');
    if (expectedSig.length !== actualSig.length) return null;
    if (!timingSafeEqual(expectedSig, actualSig)) return null;

    const rawClaims: unknown = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    );
    return validateParsedClaims(rawClaims);
  } catch {
    return null;
  }
}
