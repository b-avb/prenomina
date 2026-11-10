import { createHmac, createPublicKey, timingSafeEqual, verify, type JsonWebKey } from 'node:crypto';
import { resolveAuthEnvConfig, type AuthEnvConfig } from '../config/env.config.js';
import { UnauthorizedError } from '../utils/app-error.js';

export interface VerifiedEntraIdentity {
  entraOid: string;
  username: string;
  email: string;
  fullName: string | null;
  tenantId: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface EntraJwtPayload {
  iss?: string;
  aud?: string | string[];
  tid?: string;
  oid?: string;
  sub?: string;
  preferred_username?: string;
  upn?: string;
  email?: string;
  unique_name?: string;
  name?: string;
  exp?: number;
  nbf?: number;
}

interface JwksResponse {
  keys?: Array<JsonWebKey & { kid?: string; x5c?: string[] }>;
}

interface CachedJwks {
  fetchedAtMs: number;
  keysByKid: Map<string, JsonWebKey>;
}

const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CLOCK_SKEW_SECONDS = 60;
const jwksCacheByTenant = new Map<string, CachedJwks>();

function decodeBase64UrlJson<T>(segment: string): T {
  try {
    const json = Buffer.from(segment, 'base64url').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    throw new UnauthorizedError('El token de Microsoft Entra ID tiene un formato inválido.');
  }
}

export function buildAllowedAudiences(authConfig: AuthEnvConfig): Set<string> {
  const allowed = new Set<string>();
  const addCandidate = (value: string): void => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    allowed.add(trimmed);
  };

  addCandidate(authConfig.azureClientId);
  addCandidate(authConfig.azureAudience);

  if (authConfig.azureApiScope) {
    const scope = authConfig.azureApiScope.trim();
    addCandidate(scope);
    if (scope.startsWith('api://')) {
      const withoutScheme = scope.slice('api://'.length);
      const appIdentifier = withoutScheme.split('/')[0] ?? '';
      if (appIdentifier) {
        addCandidate(`api://${appIdentifier}`);
        addCandidate(appIdentifier);
      }
    }
  }

  return allowed;
}

async function getMicrosoftJwk(tenantId: string, kid: string): Promise<JsonWebKey> {
  const now = Date.now();
  const cached = jwksCacheByTenant.get(tenantId);
  if (cached && now - cached.fetchedAtMs < JWKS_CACHE_TTL_MS) {
    const existing = cached.keysByKid.get(kid);
    if (existing) return existing;
  }

  const jwksUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/discovery/v2.0/keys`;
  let response: Response;
  try {
    response = await fetch(jwksUrl);
  } catch {
    throw new UnauthorizedError(
      'No fue posible consultar las llaves públicas de Microsoft Entra ID para verificar el token.',
    );
  }

  if (!response.ok) {
    throw new UnauthorizedError(
      `No se pudieron obtener las llaves JWKS del tenant de Microsoft Entra ID (HTTP ${response.status}).`,
    );
  }

  const body = (await response.json()) as JwksResponse;
  const keysByKid = new Map<string, JsonWebKey>();
  for (const key of body.keys ?? []) {
    if (key.kid) {
      keysByKid.set(key.kid, key);
    }
  }

  jwksCacheByTenant.set(tenantId, {
    fetchedAtMs: now,
    keysByKid,
  });

  const matched = keysByKid.get(kid);
  if (!matched) {
    throw new UnauthorizedError(
      'La firma del token de Microsoft Entra ID no coincide con ninguna llave activa del tenant.',
    );
  }
  return matched;
}

export async function verifyMicrosoftEntraToken(
  rawToken: string,
  authConfig: AuthEnvConfig = resolveAuthEnvConfig(),
): Promise<VerifiedEntraIdentity> {
  const cleaned = rawToken.trim().replace(/^Bearer\s+/i, '');
  const parts = cleaned.split('.');
  if (parts.length !== 3) {
    throw new UnauthorizedError('El token de Microsoft Entra ID no es un JWT válido.');
  }
  const [headerSeg, payloadSeg, signatureSeg] = parts as [string, string, string];
  const header = decodeBase64UrlJson<JwtHeader>(headerSeg);
  const payload = decodeBase64UrlJson<EntraJwtPayload>(payloadSeg);

  if (!authConfig.azureTenantId || !authConfig.azureClientId) {
    throw new UnauthorizedError(
      'El inicio de sesión con Microsoft Entra ID aún no tiene configuradas las variables AZURE_TENANT_ID y AZURE_CLIENT_ID en el servidor.',
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp + CLOCK_SKEW_SECONDS < nowSec) {
    throw new UnauthorizedError('La sesión de Microsoft Entra ID ha expirado. Inicia sesión nuevamente.');
  }
  if (typeof payload.nbf === 'number' && payload.nbf - CLOCK_SKEW_SECONDS > nowSec) {
    throw new UnauthorizedError('El token de Microsoft Entra ID aún no es válido (nbf).');
  }

  const tokenTenantId = (payload.tid ?? '').trim().toLowerCase();
  const expectedTenantId = authConfig.azureTenantId.trim().toLowerCase();
  if (!tokenTenantId || tokenTenantId !== expectedTenantId) {
    throw new UnauthorizedError(
      'El token de Microsoft pertenece a un directorio (Tenant ID) distinto al institucional de la USTA.',
    );
  }

  const allowedAudiences = buildAllowedAudiences(authConfig);
  const tokenAudiences = Array.isArray(payload.aud)
    ? payload.aud.map((a) => String(a).trim().toLowerCase())
    : payload.aud
      ? [String(payload.aud).trim().toLowerCase()]
      : [];

  if (
    allowedAudiences.size > 0 &&
    !tokenAudiences.some((aud) => allowedAudiences.has(aud))
  ) {
    throw new UnauthorizedError(
      'El token de Microsoft Entra ID no fue emitido para esta aplicación institucional (Audience inválida).',
    );
  }

  const signingInput = Buffer.from(`${headerSeg}.${payloadSeg}`, 'utf8');
  const signatureBytes = Buffer.from(signatureSeg, 'base64url');

  const testSecret = process.env.ENTRA_TEST_HS256_SECRET;
  if (header.alg === 'HS256' && testSecret && process.env.NODE_ENV !== 'production') {
    const expectedSig = createHmac('sha256', testSecret).update(signingInput).digest();
    if (
      expectedSig.length !== signatureBytes.length ||
      !timingSafeEqual(expectedSig, signatureBytes)
    ) {
      throw new UnauthorizedError('Firma de token Microsoft de prueba inválida.');
    }
  } else if (header.alg === 'RS256' && header.kid) {
    const jwk = await getMicrosoftJwk(authConfig.azureTenantId, header.kid);
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const isValidSignature = verify('RSA-SHA256', signingInput, publicKey, signatureBytes);
    if (!isValidSignature) {
      throw new UnauthorizedError('La firma criptográfica del token de Microsoft Entra ID es inválida.');
    }
  } else {
    throw new UnauthorizedError(
      `Algoritmo de firma de token Microsoft no soportado (${header.alg ?? 'desconocido'}).`,
    );
  }

  const rawPrincipal = (
    payload.preferred_username ||
    payload.upn ||
    payload.email ||
    payload.unique_name ||
    ''
  )
    .trim()
    .toLowerCase();

  if (!rawPrincipal) {
    throw new UnauthorizedError(
      'El token de Microsoft Entra ID no contiene el correo o nombre de usuario institucional (preferred_username / upn).',
    );
  }

  const email = rawPrincipal.includes('@')
    ? rawPrincipal
    : `${rawPrincipal}@${authConfig.institutionalDomain}`;
  const emailDomain = email.split('@')[1] ?? '';

  if (
    authConfig.institutionalDomain &&
    emailDomain &&
    emailDomain !== authConfig.institutionalDomain.toLowerCase()
  ) {
    throw new UnauthorizedError(
      `Solo se permiten cuentas del dominio institucional @${authConfig.institutionalDomain} (recibido: ${email}).`,
    );
  }

  const username = (email.split('@')[0] ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');

  const entraOid = (payload.oid || payload.sub || '').trim();
  if (!entraOid || !username) {
    throw new UnauthorizedError(
      'El token de Microsoft Entra ID no incluye el identificador de objeto (oid) o usuario.',
    );
  }

  return {
    entraOid,
    username,
    email,
    fullName: payload.name ? payload.name.trim() : null,
    tenantId: tokenTenantId,
  };
}
