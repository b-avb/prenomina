import {
  AcademicOrganizationDomain,
  DEFAULT_TEMPORARY_PASSWORD,
  INSTITUTIONAL_EMAIL_DOMAIN,
  type ActorContext,
  type AuthConfigResponse,
  type AuthSessionResponse,
  type AuthUser,
  type ChangePasswordDto,
  type CreateUserAccountDto,
  type IdGenerator,
  type LoginDto,
  type MicrosoftLoginDto,
  type PayrollRole,
  type ResetUserPasswordDto,
  type ResetUserPasswordResponse,
} from '@usta/domain';
import { verifyMicrosoftEntraToken } from '../auth/entra-token-verifier.js';
import { hashPassword, signAuthToken, verifyPassword } from '../auth/password-crypto.js';
import { resolveAuthEnvConfig } from '../config/env.config.js';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { AcademicUnitRecord, UserRecord } from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

const USERNAME_PATTERN = /^[a-z0-9._-]{3,60}$/;

export function sanitizeUsernameInput(raw: string): string {
  const withoutDomain = raw.trim().toLowerCase().split('@')[0] ?? '';
  return withoutDomain
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');
}

export function buildInstitutionalEmail(
  username: string,
  domain = resolveAuthEnvConfig().institutionalDomain || INSTITUTIONAL_EMAIL_DOMAIN,
): string {
  return `${sanitizeUsernameInput(username)}@${domain.trim().toLowerCase()}`;
}

export function buildDefaultSeedUsers(
  units: AcademicUnitRecord[],
  passwordHash = hashPassword(DEFAULT_TEMPORARY_PASSWORD),
): UserRecord[] {
  const nowIso = new Date().toISOString();
  const usedUsernames = new Set<string>();

  const allocateUniqueUsername = (candidate: string, fallbackSuffix: string): string => {
    const base = sanitizeUsernameInput(candidate) || 'usuario.usta';
    if (!usedUsernames.has(base)) {
      usedUsernames.add(base);
      return base;
    }
    const withSuffix = sanitizeUsernameInput(`${base}.${fallbackSuffix}`);
    if (!usedUsernames.has(withSuffix)) {
      usedUsernames.add(withSuffix);
      return withSuffix;
    }
    let counter = 2;
    while (usedUsernames.has(`${base}.${counter}`)) {
      counter++;
    }
    const numbered = `${base}.${counter}`;
    usedUsernames.add(numbered);
    return numbered;
  };

  const sandraUsername = allocateUniqueUsername('sandra.parra', 'direccion');
  const wilmarUsername = allocateUniqueUsername('wilmar.ruiz', 'vicerrectoria');
  const researchUsername = allocateUniqueUsername('investigacion', 'sicddi');

  const governanceUsers: UserRecord[] = [
    {
      id: 'user-director-ea',
      username: sandraUsername,
      email: buildInstitutionalEmail(sandraUsername),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash,
      fullName: 'Sandra Lizeth Parra Cruz',
      role: 'director',
      unitId: null,
      mustChangePassword: true,
      isActive: true,
      passwordChangedAt: null,
      lastLoginAt: null,
      updatedAt: nowIso,
    },
    {
      id: 'user-vice-rector',
      username: wilmarUsername,
      email: buildInstitutionalEmail(wilmarUsername),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash,
      fullName: 'Fr. Wilmar Yesid Ruiz Cortés, O.P.',
      role: 'vice_rector',
      unitId: null,
      mustChangePassword: true,
      isActive: true,
      passwordChangedAt: null,
      lastLoginAt: null,
      updatedAt: nowIso,
    },
    {
      id: 'user-research',
      username: researchUsername,
      email: buildInstitutionalEmail(researchUsername),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash,
      fullName: 'Ing. Gloria · Dir. Investigación',
      role: 'research',
      unitId: null,
      mustChangePassword: true,
      isActive: true,
      passwordChangedAt: null,
      lastLoginAt: null,
      updatedAt: nowIso,
    },
  ];

  const deanUsers: UserRecord[] = units.map((unit) => {
    const derived = AcademicOrganizationDomain.deriveUsernameFromFullName(unit.deanName);
    const uname = allocateUniqueUsername(derived, unit.id);
    return {
      id: `user-dean-${unit.id}`,
      username: uname,
      email: buildInstitutionalEmail(uname),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash,
      fullName: unit.deanName,
      role: 'dean' as PayrollRole,
      unitId: unit.id,
      mustChangePassword: true,
      isActive: true,
      passwordChangedAt: null,
      lastLoginAt: null,
      updatedAt: nowIso,
    };
  });

  return [...governanceUsers, ...deanUsers];
}

export class AuthService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  private toAuthUser(record: UserRecord, unitNameById: ReadonlyMap<string, string>): AuthUser {
    return {
      id: record.id,
      username: record.username,
      email: record.email ?? buildInstitutionalEmail(record.username),
      entraOid: record.entraOid ?? null,
      authProvider: record.authProvider ?? 'hybrid',
      fullName: record.fullName,
      role: record.role,
      unitId: record.unitId,
      unitName: record.unitId ? (unitNameById.get(record.unitId) ?? null) : null,
      mustChangePassword: record.mustChangePassword,
      isActive: record.isActive,
      passwordChangedAt: record.passwordChangedAt,
      lastLoginAt: record.lastLoginAt ?? null,
      updatedAt: record.updatedAt,
    };
  }

  private async buildUnitNameMap(db: DbExecutor): Promise<Map<string, string>> {
    const units = await this.repos.units.listAll(db);
    return new Map(units.map((u) => [u.id, u.name]));
  }

  public getAuthConfig(): AuthConfigResponse {
    const cfg = resolveAuthEnvConfig();
    const hasEntraCredentials = Boolean(cfg.azureTenantId && cfg.azureClientId);
    const microsoftEnabled =
      hasEntraCredentials && (cfg.mode === 'hybrid' || cfg.mode === 'microsoft');

    return {
      authMode: cfg.mode,
      allowLocalLogin: cfg.mode !== 'microsoft' || !microsoftEnabled,
      microsoftEntra: {
        enabled: microsoftEnabled,
        tenantId: cfg.azureTenantId || null,
        clientId: cfg.azureClientId || null,
        apiScope: cfg.azureApiScope || null,
        authority: cfg.azureTenantId
          ? `https://login.microsoftonline.com/${cfg.azureTenantId}`
          : null,
        institutionalDomain: cfg.institutionalDomain,
        cacheLocation: cfg.msalCacheLocation,
      },
    };
  }

  public async ensureDefaultUsersSeeded(): Promise<number> {
    return this.tx.run(async (trx) => {
      const existingCount = await this.repos.users.count(trx);
      if (existingCount > 0) return 0;
      const units = await this.repos.units.listAll(trx);
      const seedUsers = buildDefaultSeedUsers(units);
      await this.repos.users.insertMany(trx, seedUsers);
      return seedUsers.length;
    });
  }

  public async login(dto: LoginDto): Promise<AuthSessionResponse> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.allowLocalLogin) {
      throw new UnauthorizedError(
        `El inicio de sesión con contraseña local está deshabilitado. Ingresa con tu cuenta institucional de Microsoft (@${authConfig.microsoftEntra.institutionalDomain}).`,
      );
    }

    const db = this.tx.executor;
    const username = sanitizeUsernameInput(dto.username);
    if (!username || !dto.password) {
      throw new BadRequestError('Debes ingresar tu nombre de usuario y contraseña.');
    }

    const userRecord = await this.repos.users.findByUsername(db, username);
    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError(
        'Usuario o contraseña incorrectos. Verifica el nombre de usuario (sin @dominio) e intenta nuevamente.',
      );
    }

    const valid = verifyPassword(dto.password, userRecord.passwordHash);
    if (!valid) {
      throw new UnauthorizedError(
        'Usuario o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.',
      );
    }

    const nowIso = new Date().toISOString();
    const updatedRecord: UserRecord = {
      ...userRecord,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    };
    await this.repos.users.update(db, updatedRecord);

    const unitNameMap = await this.buildUnitNameMap(db);
    const user = this.toAuthUser(updatedRecord, unitNameMap);
    const token = signAuthToken(user);
    return { token, user };
  }

  public async loginWithMicrosoft(dto: MicrosoftLoginDto): Promise<AuthSessionResponse> {
    const rawToken = (dto.idToken || dto.accessToken || '').trim();
    if (!rawToken) {
      throw new BadRequestError(
        'Se requiere el token de identidad (idToken o accessToken) emitido por Microsoft Entra ID.',
      );
    }

    const envAuth = resolveAuthEnvConfig();
    const verified = await verifyMicrosoftEntraToken(rawToken, envAuth);

    return this.tx.run(async (trx) => {
      let existing = await this.repos.users.findByEntraOid(trx, verified.entraOid, {
        forUpdate: true,
      });
      if (!existing) {
        existing = await this.repos.users.findByEmail(trx, verified.email, {
          forUpdate: true,
        });
      }
      if (!existing) {
        existing = await this.repos.users.findByUsername(trx, verified.username, {
          forUpdate: true,
        });
      }

      if (!existing || !existing.isActive) {
        throw new UnauthorizedError(
          `Tu cuenta institucional (${verified.email}) fue autenticada por Microsoft Entra ID, pero el usuario '@${verified.username}' aún no tiene un rol asignado o activo en Prenómina. Solicita la habilitación a la Dirección de Enseñanza y Aprendizaje.`,
        );
      }

      const nowIso = new Date().toISOString();
      const firstTimeEntraLink = existing.entraOid !== verified.entraOid;
      const updated: UserRecord = {
        ...existing,
        email: verified.email,
        entraOid: verified.entraOid,
        authProvider: existing.authProvider === 'local' ? 'hybrid' : (existing.authProvider ?? 'hybrid'),
        mustChangePassword: false,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);

      const unitNameMap = await this.buildUnitNameMap(trx);
      if (firstTimeEntraLink) {
        const periodCode = await this.periodContext.resolvePeriod(trx);
        const unitName = updated.unitId
          ? (unitNameMap.get(updated.unitId) ?? 'Institucional')
          : 'Dirección Institucional';
        await this.audit.record(
          trx,
          {
            name: updated.fullName,
            role: updated.role,
            userId: updated.id,
            username: updated.username,
            unitId: updated.unitId,
          },
          {
            periodCode,
            unitId: updated.unitId,
            unitName,
            action: 'Vinculación de Cuenta Institucional Microsoft Entra ID (AD SSO)',
            previousValue: existing.entraOid ?? 'Cuenta local sin OID vinculado',
            newValue: `${verified.email} (OID: ${verified.entraOid})`,
            reason: 'Autenticación institucional mediante Directorio Activo USTA',
          },
        );
      }

      const user = this.toAuthUser(updated, unitNameMap);
      const token = signAuthToken(user);
      return { token, user };
    });
  }

  public async getMe(userId: string): Promise<AuthUser> {
    const db = this.tx.executor;
    const userRecord = await this.repos.users.findById(db, userId);
    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError('El usuario de la sesión ya no se encuentra activo.');
    }
    const unitNameMap = await this.buildUnitNameMap(db);
    return this.toAuthUser(userRecord, unitNameMap);
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthSessionResponse> {
    const currentPassword = dto.currentPassword ?? '';
    const newPassword = dto.newPassword ?? '';

    if (newPassword.length < 8) {
      throw new BadRequestError('La nueva contraseña debe tener mínimo 8 caracteres.');
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new BadRequestError(
        'La nueva contraseña debe incluir al menos una letra y un número.',
      );
    }
    if (newPassword === currentPassword) {
      throw new BadRequestError(
        'La nueva contraseña debe ser diferente a la contraseña temporal o actual.',
      );
    }

    return this.tx.run(async (trx) => {
      const existing = await this.repos.users.findById(trx, userId, { forUpdate: true });
      if (!existing || !existing.isActive) {
        throw new UnauthorizedError('Cuenta de usuario no encontrada o inactiva.');
      }

      if (!verifyPassword(currentPassword, existing.passwordHash)) {
        throw new UnauthorizedError(
          'La contraseña temporal o actual ingresada no es correcta.',
        );
      }

      const nowIso = new Date().toISOString();
      const updated: UserRecord = {
        ...existing,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false,
        passwordChangedAt: nowIso,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);

      const periodCode = await this.periodContext.resolvePeriod(trx);
      const unitNameMap = await this.buildUnitNameMap(trx);
      const unitName = updated.unitId
        ? (unitNameMap.get(updated.unitId) ?? ' Institucional')
        : 'Dirección Institucional';

      await this.audit.record(
        trx,
        {
          name: updated.fullName,
          role: updated.role,
          userId: updated.id,
          username: updated.username,
          unitId: updated.unitId,
        },
        {
          periodCode,
          unitId: updated.unitId,
          unitName,
          action: 'Activación de Contraseña Personal (Cambio de Clave Temporal)',
          previousValue: existing.mustChangePassword
            ? 'Contraseña temporal inicial'
            : 'Contraseña anterior',
          newValue: `Contraseña actualizada por @${updated.username}`,
          reason: 'Cambio obligatorio de contraseña al iniciar sesión',
        },
      );

      const user = this.toAuthUser(updated, unitNameMap);
      const token = signAuthToken(user);
      return { token, user };
    });
  }

  public async listUsers(): Promise<AuthUser[]> {
    const db = this.tx.executor;
    const [records, unitNameMap] = await Promise.all([
      this.repos.users.listAll(db),
      this.buildUnitNameMap(db),
    ]);
    return records.map((r) => this.toAuthUser(r, unitNameMap));
  }

  public async createUser(
    actor: ActorContext,
    dto: CreateUserAccountDto,
  ): Promise<ResetUserPasswordResponse> {
    const username = sanitizeUsernameInput(dto.username);
    if (!USERNAME_PATTERN.test(username)) {
      throw new BadRequestError(
        'El nombre de usuario debe tener entre 3 y 60 caracteres (solo letras minúsculas, números, punto o guion, sin @dominio).',
      );
    }
    const temporaryPassword = dto.temporaryPassword?.trim() || DEFAULT_TEMPORARY_PASSWORD;
    if (temporaryPassword.length < 6) {
      throw new BadRequestError(
        'La contraseña temporal debe tener al menos 6 caracteres.',
      );
    }

    return this.tx.run(async (trx) => {
      const existing = await this.repos.users.findByUsername(trx, username, {
        forUpdate: true,
      });
      if (existing) {
        throw new ConflictError(`El nombre de usuario '${username}' ya está registrado.`);
      }

      if (dto.unitId) {
        const unit = await this.repos.units.findById(trx, dto.unitId);
        if (!unit) {
          throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
        }
      }

      const nowIso = new Date().toISOString();
      const record: UserRecord = {
        id: `user-${this.ids.next()}`,
        username,
        email: dto.email?.trim().toLowerCase() || buildInstitutionalEmail(username),
        entraOid: null,
        authProvider: dto.authProvider ?? 'hybrid',
        passwordHash: hashPassword(temporaryPassword),
        fullName: dto.fullName.trim(),
        role: dto.role,
        unitId: dto.unitId ?? null,
        mustChangePassword: true,
        isActive: true,
        passwordChangedAt: null,
        lastLoginAt: null,
        updatedAt: nowIso,
      };
      await this.repos.users.insertMany(trx, [record]);

      const periodCode = await this.periodContext.resolvePeriod(trx);
      const unitNameMap = await this.buildUnitNameMap(trx);
      const unitName = record.unitId
        ? (unitNameMap.get(record.unitId) ?? 'Institucional')
        : 'Dirección Institucional';

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: record.unitId,
        unitName,
        action: 'Creación de Usuario con Contraseña Temporal',
        newValue: `@${record.username} (${record.fullName} · rol: ${record.role})`,
        reason: 'Asignación de credenciales temporales con cambio obligatorio en primer ingreso',
      });

      return {
        user: this.toAuthUser(record, unitNameMap),
        temporaryPassword,
      };
    });
  }

  public async resetPasswordToTemporary(
    actor: ActorContext,
    dto: ResetUserPasswordDto,
  ): Promise<ResetUserPasswordResponse> {
    const temporaryPassword = dto.temporaryPassword?.trim() || DEFAULT_TEMPORARY_PASSWORD;
    if (temporaryPassword.length < 6) {
      throw new BadRequestError(
        'La contraseña temporal debe tener al menos 6 caracteres.',
      );
    }

    return this.tx.run(async (trx) => {
      const existing = await this.repos.users.findById(trx, dto.id, { forUpdate: true });
      if (!existing) {
        throw new NotFoundError(`El usuario '${dto.id}' no existe.`);
      }

      const nowIso = new Date().toISOString();
      const updated: UserRecord = {
        ...existing,
        passwordHash: hashPassword(temporaryPassword),
        mustChangePassword: true,
        passwordChangedAt: null,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);

      const periodCode = await this.periodContext.resolvePeriod(trx);
      const unitNameMap = await this.buildUnitNameMap(trx);
      const unitName = updated.unitId
        ? (unitNameMap.get(updated.unitId) ?? 'Institucional')
        : 'Dirección Institucional';

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: updated.unitId,
        unitName,
        action: 'Restablecimiento de Contraseña Temporal',
        previousValue: `@${updated.username}`,
        newValue: 'Contraseña temporal activa (cambio obligatorio en próximo inicio de sesión)',
        reason: `Restablecimiento ejecutado por ${actor.name}`,
      });

      return {
        user: this.toAuthUser(updated, unitNameMap),
        temporaryPassword,
      };
    });
  }

  /**
   * Synchronizes or provisions the Dean user account inside an ongoing unit/dean transaction.
   */
  public async syncUnitDeanUserInTransaction(
    trx: DbExecutor,
    unit: { id: string; name: string; deanName: string },
    options?: { username?: string; temporaryPassword?: string },
  ): Promise<AuthUser> {
    const existingForUnit = await this.repos.users.findByUnitId(trx, unit.id, {
      forUpdate: true,
    });
    const desiredBase =
      (options?.username ? sanitizeUsernameInput(options.username) : '') ||
      AcademicOrganizationDomain.deriveUsernameFromFullName(unit.deanName);
    const temporaryPassword =
      options?.temporaryPassword?.trim() || DEFAULT_TEMPORARY_PASSWORD;
    const nowIso = new Date().toISOString();

    const resolveUniqueUsername = async (
      baseCandidate: string,
      currentUserId?: string,
    ): Promise<string> => {
      const base = sanitizeUsernameInput(baseCandidate) || `decano.${unit.id}`;
      const conflict = await this.repos.users.findByUsername(trx, base);
      if (!conflict || conflict.id === currentUserId) return base;
      const withUnit = sanitizeUsernameInput(`${base}.${unit.id}`);
      const conflictUnit = await this.repos.users.findByUsername(trx, withUnit);
      if (!conflictUnit || conflictUnit.id === currentUserId) return withUnit;
      return `${base}.${Date.now().toString(36).slice(-4)}`;
    };

    if (existingForUnit) {
      const deanChanged =
        existingForUnit.fullName.trim().toLowerCase() !==
        unit.deanName.trim().toLowerCase();
      const shouldUpdateUsername = Boolean(options?.username?.trim()) || deanChanged;
      const nextUsername = shouldUpdateUsername
        ? await resolveUniqueUsername(desiredBase, existingForUnit.id)
        : existingForUnit.username;
      const shouldResetPassword =
        Boolean(options?.temporaryPassword?.trim()) || deanChanged;

      const updated: UserRecord = {
        ...existingForUnit,
        username: nextUsername,
        email: buildInstitutionalEmail(nextUsername),
        entraOid: deanChanged ? null : existingForUnit.entraOid,
        authProvider: existingForUnit.authProvider ?? 'hybrid',
        fullName: unit.deanName.trim(),
        passwordHash: shouldResetPassword
          ? hashPassword(temporaryPassword)
          : existingForUnit.passwordHash,
        mustChangePassword: shouldResetPassword
          ? true
          : existingForUnit.mustChangePassword,
        passwordChangedAt: shouldResetPassword ? null : existingForUnit.passwordChangedAt,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);
      return {
        id: updated.id,
        username: updated.username,
        email: updated.email ?? buildInstitutionalEmail(updated.username),
        entraOid: updated.entraOid ?? null,
        authProvider: updated.authProvider ?? 'hybrid',
        fullName: updated.fullName,
        role: updated.role,
        unitId: updated.unitId,
        unitName: unit.name,
        mustChangePassword: updated.mustChangePassword,
        isActive: updated.isActive,
        passwordChangedAt: updated.passwordChangedAt,
        lastLoginAt: updated.lastLoginAt ?? null,
        updatedAt: updated.updatedAt,
      };
    }

    const uniqueUsername = await resolveUniqueUsername(desiredBase);
    const created: UserRecord = {
      id: `user-dean-${unit.id}`,
      username: uniqueUsername,
      email: buildInstitutionalEmail(uniqueUsername),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash: hashPassword(temporaryPassword),
      fullName: unit.deanName.trim(),
      role: 'dean',
      unitId: unit.id,
      mustChangePassword: true,
      isActive: true,
      passwordChangedAt: null,
      lastLoginAt: null,
      updatedAt: nowIso,
    };
    await this.repos.users.insertMany(trx, [created]);
    return {
      id: created.id,
      username: created.username,
      email: created.email ?? buildInstitutionalEmail(created.username),
      entraOid: created.entraOid ?? null,
      authProvider: created.authProvider ?? 'hybrid',
      fullName: created.fullName,
      role: created.role,
      unitId: created.unitId,
      unitName: unit.name,
      mustChangePassword: created.mustChangePassword,
      isActive: created.isActive,
      passwordChangedAt: created.passwordChangedAt,
      lastLoginAt: created.lastLoginAt ?? null,
      updatedAt: created.updatedAt,
    };
  }
}
