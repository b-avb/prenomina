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
    throw new UnauthorizedError('No fue posible validar las credenciales de Microsoft.');
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
      'No fue posible conectar con el servicio de autenticación de Microsoft. Intente nuevamente.',
    );
  }

  if (!response.ok) {
    throw new UnauthorizedError(
      'El servicio de autenticación de Microsoft no respondió correctamente. Intente nuevamente.',
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
      'No fue posible verificar la sesión institucional de Microsoft. Inicie sesión de nuevo.',
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
    throw new UnauthorizedError('Las credenciales recibidas de Microsoft no son válidas.');
  }
  const [headerSeg, payloadSeg, signatureSeg] = parts as [string, string, string];
  const header = decodeBase64UrlJson<JwtHeader>(headerSeg);
  const payload = decodeBase64UrlJson<EntraJwtPayload>(payloadSeg);

  if (!authConfig.azureTenantId || !authConfig.azureClientId) {
    throw new UnauthorizedError(
      'El ingreso con cuenta institucional de Microsoft no se encuentra habilitado en este momento.',
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp + CLOCK_SKEW_SECONDS < nowSec) {
    throw new UnauthorizedError('La sesión de Microsoft expiró. Inicie sesión nuevamente.');
  }
  if (typeof payload.nbf === 'number' && payload.nbf - CLOCK_SKEW_SECONDS > nowSec) {
    throw new UnauthorizedError('La sesión de Microsoft aún no es válida. Intente nuevamente.');
  }

  const tokenTenantId = (payload.tid ?? '').trim().toLowerCase();
  const expectedTenantId = authConfig.azureTenantId.trim().toLowerCase();
  if (!tokenTenantId || tokenTenantId !== expectedTenantId) {
    throw new UnauthorizedError(
      'La cuenta de Microsoft seleccionada no pertenece al directorio institucional de la Universidad Santo Tomás.',
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
      'La sesión de Microsoft no corresponde a esta aplicación institucional.',
    );
  }

  const signingInput = Buffer.from(`${headerSeg}.${payloadSeg}`, 'utf8');
  const signatureBytes = Buffer.from(signatureSeg, 'base64url');

  const testSecret = process.env.ENTRA_TEST_HS256_SECRET;
  if (header.alg === 'HS256' && testSecret && process.env.NODE_ENV === 'test') {
    const expectedSig = createHmac('sha256', testSecret).update(signingInput).digest();
    if (
      expectedSig.length !== signatureBytes.length ||
      !timingSafeEqual(expectedSig, signatureBytes)
    ) {
      throw new UnauthorizedError('No fue posible verificar la sesión de Microsoft.');
    }
  } else if (header.alg === 'RS256' && header.kid) {
    const jwk = await getMicrosoftJwk(authConfig.azureTenantId, header.kid);
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const isValidSignature = verify('RSA-SHA256', signingInput, publicKey, signatureBytes);
    if (!isValidSignature) {
      throw new UnauthorizedError('No fue posible verificar la autenticidad de la sesión de Microsoft.');
    }
  } else {
    throw new UnauthorizedError(
      'El formato de autenticación recibido de Microsoft no es compatible.',
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
      'La cuenta de Microsoft no reportó un correo institucional válido.',
    );
  }

  const email = rawPrincipal.includes('@')
    ? rawPrincipal
    : `${rawPrincipal}@${authConfig.institutionalDomain}`;
  const emailDomain = (email.split('@')[1] ?? '').toLowerCase();
  const allowedDomains =
    authConfig.institutionalDomains.length > 0
      ? authConfig.institutionalDomains.map((d) => d.toLowerCase())
      : [authConfig.institutionalDomain.toLowerCase()].filter(Boolean);

  if (allowedDomains.length > 0 && emailDomain && !allowedDomains.includes(emailDomain)) {
    throw new UnauthorizedError(
      `Ingrese con un correo institucional autorizado (${allowedDomains.map((d) => `@${d}`).join(' o ')}).`,
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
      'No fue posible identificar al usuario en el directorio institucional de Microsoft.',
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
