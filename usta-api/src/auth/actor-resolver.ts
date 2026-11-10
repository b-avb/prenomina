import type { IncomingMessage } from 'node:http';
import type { ActorContext, PayrollRole } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { UserRepository } from '../repositories/user.repository.js';
import {
  ForbiddenError,
  PasswordChangeRequiredError,
  UnauthorizedError,
} from '../utils/app-error.js';
import { verifyAuthToken, type AuthTokenClaims } from './password-crypto.js';

export const ROLE_PERMISSIONS = {
  /** Institutional governance, organization, catalog, rules, and period creation. */
  management: ['director', 'vice_rector'] as const satisfies readonly PayrollRole[],
  /** Faculty workload (Annex 2) and Annex 3 pre-approval submission. */
  workload: ['director', 'dean', 'vice_rector'] as const satisfies readonly PayrollRole[],
  /** Vice-Rectorate Annex 3 decision. */
  approvalDecision: ['director', 'vice_rector'] as const satisfies readonly PayrollRole[],
  /** SICDDI Research matrix (Annex 7). */
  research: ['director', 'research', 'vice_rector'] as const satisfies readonly PayrollRole[],
  /** Any authenticated active user in the platform. */
  authenticated: [
    'director',
    'dean',
    'vice_rector',
    'research',
  ] as const satisfies readonly PayrollRole[],
} as const;

export interface ResolveActorOptions {
  allowPendingPasswordChange?: boolean;
}

/** Resolves the authenticated user of a request from a verified JWT and enforces RBAC. */
export interface ActorResolver {
  resolve(
    req: IncomingMessage,
    allowedRoles?: readonly PayrollRole[],
    options?: ResolveActorOptions,
  ): Promise<ActorContext>;
}

export function extractBearerToken(req: IncomingMessage): string | null {
  const raw = req.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match?.[1]?.trim() ?? null;
}

export function requireValidTokenClaims(
  req: IncomingMessage,
  options: ResolveActorOptions = {},
): AuthTokenClaims {
  const token = extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedError(
      'Autenticación requerida: debes iniciar sesión con tu cuenta institucional (JWT Bearer).',
    );
  }
  const claims = verifyAuthToken(token);
  if (!claims) {
    throw new UnauthorizedError(
      'Tu sesión ha expirado o el token JWT no es válido. Por favor inicia sesión nuevamente.',
    );
  }
  if (claims.mustChangePassword && !options.allowPendingPasswordChange) {
    throw new PasswordChangeRequiredError();
  }
  return claims;
}

/**
 * Enforces multi-tenant faculty isolation: a Dean (`role === 'dean'`) may only
 * mutate resources belonging to their assigned `actor.unitId`.
 */
export function assertUnitAccess(actor: ActorContext, targetUnitId: string): void {
  if (actor.role === 'dean') {
    if (!actor.unitId || actor.unitId !== targetUnitId) {
      throw new ForbiddenError(
        `Acceso denegado: como Decano(a) solo tienes autorización para gestionar tu propia unidad académica (${actor.unitId ?? 'sin unidad asignada'}).`,
      );
    }
  }
}

/**
 * Strictly resolves the acting user from a signed RFC 7519 HMAC-SHA256 Bearer JWT
 * and verifies live account status, role, unit assignment, and password state in MariaDB.
 */
export class JwtActorResolver implements ActorResolver {
  constructor(
    private readonly db: DbExecutor,
    private readonly usersRepo: UserRepository,
  ) {}

  public async resolve(
    req: IncomingMessage,
    allowedRoles?: readonly PayrollRole[],
    options: ResolveActorOptions = {},
  ): Promise<ActorContext> {
    const claims = requireValidTokenClaims(req, options);
    const userRecord = await this.usersRepo.findById(this.db, claims.sub);

    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError(
        'La cuenta de usuario asociada a la sesión no existe o se encuentra desactivada.',
      );
    }

    if (
      claims.pwdChangedAt !== (userRecord.passwordChangedAt ?? null) ||
      (userRecord.mustChangePassword && !claims.mustChangePassword)
    ) {
      throw new UnauthorizedError(
        'Tus credenciales fueron actualizadas o restablecidas recientemente. Inicia sesión nuevamente.',
      );
    }

    if (userRecord.mustChangePassword && !options.allowPendingPasswordChange) {
      throw new PasswordChangeRequiredError();
    }

    const authoritativeRole = userRecord.role;
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(authoritativeRole)
    ) {
      throw new ForbiddenError(
        `El rol '${authoritativeRole}' no tiene permisos para ejecutar esta operación (permitidos: ${allowedRoles.join(', ')}).`,
      );
    }

    return {
      name: userRecord.fullName,
      role: authoritativeRole,
      userId: userRecord.id,
      username: userRecord.username,
      unitId: userRecord.unitId,
    };
  }
}
