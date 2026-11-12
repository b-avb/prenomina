import type { IncomingMessage } from 'node:http';
import type { ActorContext, PayrollRole } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { AcademicUnitRepository } from '../repositories/academic-unit.repository.js';
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
  /** Permits access while `mustChangePassword` is active (used only by `/api/auth/me` and `/api/auth/change-password`). */
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

/**
 * Strips diacritics, punctuation, and redundant whitespace to compare human names case-insensitively
 * when matching a Dean user's `fullName` against `academic_units.dean_name`.
 */
export function normalizeComparableName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Extracts the raw token from an RFC 6750 `Authorization: Bearer <token>` request header. */
export function extractBearerToken(req: IncomingMessage): string | null {
  const raw = req.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match?.[1]?.trim() ?? null;
}

/**
 * Extracts and verifies the request's HS256 Bearer JWT, rejecting requests from accounts flagged
 * with `mustChangePassword` unless the route explicitly opts into `allowPendingPasswordChange`.
 */
export function requireValidTokenClaims(
  req: IncomingMessage,
  options: ResolveActorOptions = {},
): AuthTokenClaims {
  const token = extractBearerToken(req);
  if (!token) {
    throw new UnauthorizedError(
      'Inicie sesión con su cuenta institucional para continuar.',
    );
  }
  const claims = verifyAuthToken(token);
  if (!claims) {
    throw new UnauthorizedError(
      'Su sesión expiró o ya no es válida. Vuelva a iniciar sesión.',
    );
  }
  if (claims.mustChangePassword && !options.allowPendingPasswordChange) {
    throw new PasswordChangeRequiredError();
  }
  return claims;
}

/** Returns all academic unit IDs a Dean is authorized to manage, falling back to their primary `unitId`. */
export function getActorAllowedUnitIds(actor: ActorContext): readonly string[] {
  if (actor.managedUnitIds && actor.managedUnitIds.length > 0) {
    return actor.managedUnitIds;
  }
  return actor.unitId ? [actor.unitId] : [];
}

/**
 * Enforces faculty-level tenant isolation: a Dean (`role === 'dean'`) may only read or mutate
 * resources belonging to their resolved `managedUnitIds`. Institutional roles bypass unit scoping.
 */
export function assertUnitAccess(actor: ActorContext, targetUnitId: string): void {
  if (actor.role === 'dean') {
    const allowed = getActorAllowedUnitIds(actor);
    if (!allowed.includes(targetUnitId)) {
      throw new ForbiddenError(
        'No tiene permisos para consultar ni modificar información de otra unidad académica.',
      );
    }
  }
}

/**
 * Resolves the acting user from a signed RFC 7519 HMAC-SHA256 Bearer JWT and cross-checks
 * live account state in MariaDB on every authenticated request.
 *
 * Security invariants enforced:
 * - Immediate session revocation: tokens whose `pwdChangedAt` claim diverges from `userRecord.passwordChangedAt`
 *   (or that predate an administrative password reset) are rejected with `401 Unauthorized`.
 * - Authoritative RBAC: role checks evaluate `userRecord.role` from MariaDB rather than trusting the JWT claim.
 * - Multi-unit Dean scope: unions `userRecord.unitId` with any academic unit whose normalized `deanName`
 *   matches `userRecord.fullName`, supporting Deans who oversee both a Faculty and an academic Department.
 */
export class JwtActorResolver implements ActorResolver {
  constructor(
    private readonly db: DbExecutor,
    private readonly usersRepo: UserRepository,
    private readonly unitsRepo?: AcademicUnitRepository,
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
        'La cuenta asociada a esta sesión no existe o se encuentra inactiva.',
      );
    }

    if (
      claims.pwdChangedAt !== (userRecord.passwordChangedAt ?? null) ||
      (userRecord.mustChangePassword && !claims.mustChangePassword)
    ) {
      throw new UnauthorizedError(
        'Sus credenciales se actualizaron recientemente. Inicie sesión de nuevo.',
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
        'Su perfil no cuenta con permisos para realizar esta acción.',
      );
    }

    let managedUnitIds: string[] | undefined;
    if (authoritativeRole === 'dean') {
      const assigned = new Set<string>();
      if (userRecord.unitId) assigned.add(userRecord.unitId);
      if (this.unitsRepo) {
        const allUnits = await this.unitsRepo.listAll(this.db);
        const normUser = normalizeComparableName(userRecord.fullName);
        if (normUser) {
          for (const u of allUnits) {
            if (normalizeComparableName(u.deanName) === normUser) {
              assigned.add(u.id);
            }
          }
        }
      }
      managedUnitIds = Array.from(assigned);
    }

    return {
      name: userRecord.fullName,
      role: authoritativeRole,
      userId: userRecord.id,
      username: userRecord.username,
      unitId: userRecord.unitId,
      ...(managedUnitIds ? { managedUnitIds } : {}),
    };
  }
}
