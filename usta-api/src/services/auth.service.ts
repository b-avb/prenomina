import { randomBytes } from 'node:crypto';
import {
  AcademicOrganizationDomain,
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
import { normalizeComparableName } from '../auth/actor-resolver.js';
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

export interface OfficialInstitutionalAccountSeed {
  readonly id: string;
  readonly role: PayrollRole;
  readonly unitId: string | null;
  readonly username: string;
  readonly email: string;
  readonly fullName: string;
  readonly passwordHash: string;
}

/**
 * Cuentas institucionales oficiales de la Seccional Tunja (Gobernanza + Decanaturas y Direcciones).
 * Las contraseñas temporales iniciales están almacenadas únicamente como hashes criptográficos scrypt
 * irreversibles (nunca en texto plano dentro del repositorio).
 */
export const OFFICIAL_INSTITUTIONAL_ACCOUNTS: readonly OfficialInstitutionalAccountSeed[] = [
  {
    id: 'user-director-ea',
    role: 'director',
    unitId: null,
    username: 'dir.ensenanza',
    email: 'dir.ensenanza@ustatunja.edu.co',
    fullName: 'Sandra Lizeth Parra Cruz',
    passwordHash:
      'scrypt:614dd6ab950407470a5f5c25d77a68ee:dca4c8ecd4790177a9257c834622708d3956e326fc96d7abee4a94bee20c649657a0bb75b72ccafd04177e81e3c192adb84c09830f7323a37291c8de93a60c40',
  },
  {
    id: 'user-vice-rector',
    role: 'vice_rector',
    unitId: null,
    username: 'viceacademica',
    email: 'viceacademica@ustatunja.edu.co',
    fullName: 'Fray Wilmar Yesid Ruiz Cortés, O.P.',
    passwordHash:
      'scrypt:e6f0effd6689dfaaaa18a87112b985b9:ac2cc88792a74f65116a563f6548c9b6de0a85992973a5ff810ce46af71a8b2273eb096b342c70a2312bc4de04aec1cfdf85311dedbcc3db5b21d42c0ed88550',
  },
  {
    id: 'user-dean-arquitectura',
    role: 'dean',
    unitId: 'arquitectura',
    username: 'dec.arquitectura',
    email: 'dec.arquitectura@ustatunja.edu.co',
    fullName: 'Felipe Andrés Muñoz Cárdenas',
    passwordHash:
      'scrypt:3f12cfa3b1064a43ef0453643a184964:d5f4a0f9017cff2ad1e171b1920568899619a11551a05151b365073f83360bf72ef46f66109243c316963847343c63cc6953f4a3b2564fe25c292662aea0b919',
  },
  {
    id: 'user-dean-bioingenieria',
    role: 'dean',
    unitId: 'bioingenieria',
    username: 'bioingenieria',
    email: 'bioingenieria@ustatunja.edu.co',
    fullName: 'Yuddy Alejandra Castro Ortegón',
    passwordHash:
      'scrypt:64ad4a016ef29fe6008b280c7833ac50:336564f0d9e8e38ed3aab7032e9245d57b856fc2873386ec6edc99f20dada7ffd6b7283fd9fd9611e209c17a075740770f96d264b1211d5b494a58ca237d882e',
  },
  {
    id: 'user-dean-cilce',
    role: 'dean',
    unitId: 'cilce',
    username: 'dir.idiomas',
    email: 'dir.idiomas@ustatunja.edu.co',
    fullName: 'José Miguel Fagua Contreras',
    passwordHash:
      'scrypt:155e8dcec1436d1e642f797be0321d5b:fcfc116de2bea06874b4a8bd631f9d55c2e06efc5ab965ab7c4c3a93482227b0cc04027288e880a12d8ce90cc60266a37ba50ffc19f190a93b37f700ef504dc9',
  },
  {
    id: 'user-dean-contaduria',
    role: 'dean',
    unitId: 'contaduria',
    username: 'deccontaduria',
    email: 'deccontaduria@ustatunja.edu.co',
    fullName: 'Adriana Jiménez Herrera',
    passwordHash:
      'scrypt:8b47f5d75288407e4f8d85f6b34da756:417dd7605973ca391a13f9eb80d67e6c2f015bbc0bb5ce0cc8c7202557768956ec3c709d6ca161a0115617e03fa1adf02367b1dd5af35b7b726f107846674848',
  },
  {
    id: 'user-dean-cultura-fisica',
    role: 'dean',
    unitId: 'cultura-fisica',
    username: 'dec.culturafisica',
    email: 'dec.culturafisica@ustatunja.edu.co',
    fullName: 'Luis Rafael Hutchison Salazar',
    passwordHash:
      'scrypt:a33e7aa8cef2e4472dae0675a65185e1:97558864614ab393d3c47ec9412b1410f78d1b06693acd5b500e76325ecd3ae8dc4fb4ea1b35cc3db238440cc241919d65a2b3d4d43b9ecda6b806afdcf7d2e6',
  },
  {
    id: 'user-dean-derecho',
    role: 'dean',
    unitId: 'derecho',
    username: 'carlos.aranda',
    email: 'carlos.aranda@usantoto.edu.co',
    fullName: 'Carlos Andrés Aranda Camacho',
    passwordHash:
      'scrypt:1be903ba423c55c0d2085b321d02fa44:59b6f8b36cdbe673d63d40fd90bdf963418ee3dac5aab7285b12e3afe829aa2d1e3758bdd8added870389dcd5b48a78a0c3dee374fd4d23936adbaac1ee16cc7',
  },
  {
    id: 'user-dean-ciencias-basicas',
    role: 'dean',
    unitId: 'ciencias-basicas',
    username: 'direccion.cbasicas',
    email: 'direccion.cbasicas@ustatunja.edu.co',
    fullName: 'Ruth Marlene Sandoval Ortiz',
    passwordHash:
      'scrypt:87441b0063f5c61d5198992a445e0e7d:6ae3ba4a69affc85793e5583a9e338a7f9ef52bac79efb7eec481f55c16f70d8d731936ee23d98d4fc6c82df419ef549f1364a62b680f25257c6cd6c4f51e3e9',
  },
  {
    id: 'user-dean-humanidades',
    role: 'dean',
    unitId: 'humanidades',
    username: 'david.saenz',
    email: 'david.saenz@usantoto.edu.co',
    fullName: 'David Sáenz Guerrero',
    passwordHash:
      'scrypt:8768a0e7222553f00cafdf4da7573894:b525ab1b4fff98daee6c4720907ff00f594645c48cfe1862ba6552d98b580e2a6c27a3e18d43e7b8be7e2303c391316013e2a9f5e1b6bab9bb44125e33b8ac84',
  },
  {
    id: 'user-dean-ing-datos-ia',
    role: 'dean',
    unitId: 'ing-datos-ia',
    username: 'coord.datosia',
    email: 'coord.datosia@ustatunja.edu.co',
    fullName: 'Juan Francisco Mendoza Moreno',
    passwordHash:
      'scrypt:4a33a34152baeded856c7ba537abae83:f9146838b88e53b1c1678f58f3797556c684a48f16821b5e840f4bec7dffd8b65843af7968bd8909e6e064e1fa3f523ad484e163ffc22ed6568d1d996f66b098',
  },
  {
    id: 'user-dean-ing-ambiental',
    role: 'dean',
    unitId: 'ing-ambiental',
    username: 'dec.ambiental',
    email: 'dec.ambiental@ustatunja.edu.co',
    fullName: 'Katherine Johana Aguja Herrera',
    passwordHash:
      'scrypt:ed26e2d1f9b0ea95d7dd379830aae1d3:948f52a362fb21362616278dc8637d49d5ae657ca483d400dba731ce44118438f7ea3243529cf7349b81faffdea7f739f687dfe98c802c211e2273179441a685',
  },
  {
    id: 'user-dean-ing-civil',
    role: 'dean',
    unitId: 'ing-civil',
    username: 'dec.civil',
    email: 'dec.civil@ustatunja.edu.co',
    fullName: 'Brigid Hiomara Pacheco García',
    passwordHash:
      'scrypt:af4bc055685dde23deb1d41f6e8b186d:7df64fb128238a674435ef36fc0cd52b77f58246d8d33de6cf85078babe96a3be71bcf7b5896819b11287478aa67c50936a0a3b9fa144aea5aebd3d7a723f5ae',
  },
  {
    id: 'user-dean-ing-electronica',
    role: 'dean',
    unitId: 'ing-electronica',
    username: 'dec.electronica',
    email: 'dec.electronica@ustatunja.edu.co',
    fullName: 'William Fabián Chaparro Becerra',
    passwordHash:
      'scrypt:64d2c297e3c39b263390be1e9b7a09e2:82ea07bd0d86f3c5db5781bf6cc85aa5f59df628ed203727e5de27f564ab0a6b515d3907264082e1b0ef101adbf22da607d175275899931b0025eca3df08bb23',
  },
  {
    id: 'user-dean-ing-sistemas',
    role: 'dean',
    unitId: 'ing-sistemas',
    username: 'decsistemas',
    email: 'decsistemas@ustatunja.edu.co',
    fullName: 'Luz Santamaría Granados',
    passwordHash:
      'scrypt:cf8a6c5ae0d8b79fe7d2b9c5395cf3ab:0edc1b0915a54e179d88cfbee9bfe6bf8dee5a0586cb7cbb5080474bb0f6b2ff2e52ef7230b5d8e45dd19f3dfa6f15793b942bf19cd850d9f5f7424d509d43cd',
  },
  {
    id: 'user-dean-lic-lenguas',
    role: 'dean',
    unitId: 'lic-lenguas',
    username: 'licenciaturaenlenguas',
    email: 'licenciaturaenlenguas@ustatunja.edu.co',
    fullName: 'Gladys Leonor Arias Rodríguez',
    passwordHash:
      'scrypt:9bdd0c91706585ba6854cb5375964db2:cc05183e38de6fb52939b9ff919d415ce322c6db644221670241a1a15a43667a1ae4654a80a77348aee12fd3cfe95259bd7179cdd36b18b394d9967a9382d9cc',
  },
  {
    id: 'user-dean-marketing',
    role: 'dean',
    unitId: 'marketing',
    username: 'coord.marketingtd',
    email: 'coord.marketingtd@ustatunja.edu.co',
    fullName: 'Eduardo López Flórez',
    passwordHash:
      'scrypt:44b19f0c44e1c627c5ac0626c586c0c8:99b48dc6543c9dedec662ab7de16045e9db527833192d778cf23167e8069d494108cfbcccf599673942c0459dec429dace1da31bebf358ebd363591f3ebb363e',
  },
  {
    id: 'user-dean-negocios-int',
    role: 'dean',
    unitId: 'negocios-int',
    username: 'decinternacional',
    email: 'decinternacional@ustatunja.edu.co',
    fullName: 'Esperanza Díaz Casallas',
    passwordHash:
      'scrypt:2f5f609935ba02344b1cb1e26ccdea7f:f7ed46df1f878680175cc392c83b9727cf25f5a4f5dc27bc40f9232bd198c9ee51fbf68ea78550192b94cd395030369ac5add2e2295b3d59595ce6cb40c73b34',
  },
  {
    id: 'user-dean-diseno-interaccion',
    role: 'dean',
    unitId: 'diseno-interaccion',
    username: 'julian.delgadillo',
    email: 'julian.delgadillo@usantoto.edu.co',
    fullName: 'Julián Santiago Delgadillo Aponte',
    passwordHash:
      'scrypt:1d34892107650b1462c170ecccf23fbe:493883a3888b0cf858f40f385f7ca18a663ea60dd01c036896508057ceb2227f35821b48b96a46f3a08256f43d370f737f6101f72473472f6f06623510a25a2a',
  },
  {
    id: 'user-dean-ing-industrial',
    role: 'dean',
    unitId: 'ing-industrial',
    username: 'dec.industrial',
    email: 'dec.industrial@ustatunja.edu.co',
    fullName: 'Juan Camilo Ernesto Valderrama Balaguera',
    passwordHash:
      'scrypt:084cbd9804bad2151f0ac8d62255f10e:f4a79358db84784e5710ce0a9dccf0a638fcbffd7d5802c3e7e49b27e10908d97b30385119025fd344ccd5354fd7fe6fab12dc933faef23433b1b87b6627bf82',
  },
  {
    id: 'user-dean-ing-mecanica',
    role: 'dean',
    unitId: 'ing-mecanica',
    username: 'decanatura.mecanica',
    email: 'decanatura.mecanica@ustatunja.edu.co',
    fullName: 'Helver Mauricio Muñoz Barajas',
    passwordHash:
      'scrypt:60fe09698ca71a290507483872aac283:daf1dc32e98f24b12cc989f4c7c00160b42da379d3da30f0ef9a66f284e0ad181da6a6592bd249258df4dfda27f860b511915758d72af557a93b95b13cd0d285',
  },
  {
    id: 'user-dean-adm-empresas',
    role: 'dean',
    unitId: 'adm-empresas',
    username: 'decadministracion',
    email: 'decadministracion@ustatunja.edu.co',
    fullName: 'Jean Pierre Anchicoque Cadena',
    passwordHash:
      'scrypt:92e32f5d66bb4b3aca809520702717aa:1e69343b3a44035fa6bce6656bae3ad11f6a13aaff65ddac3d62c044551a013754694f9fecb1bcba0694fc9bbd380f6195e750d03c4cde3c50080d03af3efb29',
  },
];

export function generateSecureTemporaryPassword(): string {
  return `Usta-${randomBytes(5).toString('hex')}1A`;
}

export function buildDefaultSeedUsers(
  _units?: AcademicUnitRecord[],
  overridePasswordHash?: string,
): UserRecord[] {
  const nowIso = new Date().toISOString();

  return OFFICIAL_INSTITUTIONAL_ACCOUNTS.map((acc) => ({
    id: acc.id,
    username: acc.username,
    email: acc.email,
    entraOid: null,
    authProvider: 'hybrid',
    passwordHash: overridePasswordHash ?? acc.passwordHash,
    fullName: acc.fullName,
    role: acc.role,
    unitId: acc.unitId,
    mustChangePassword: true,
    isActive: true,
    passwordChangedAt: null,
    lastLoginAt: null,
    updatedAt: nowIso,
  }));
}

export class AuthService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  private toAuthUser(
    record: UserRecord,
    unitsContext: {
      unitNameById: ReadonlyMap<string, string>;
      units: readonly AcademicUnitRecord[];
    },
  ): AuthUser {
    let managedUnitIds: string[] | undefined;
    if (record.role === 'dean') {
      const normalizedUser = normalizeComparableName(record.fullName);
      const set = new Set<string>();
      if (record.unitId) set.add(record.unitId);
      if (normalizedUser) {
        for (const u of unitsContext.units) {
          if (normalizeComparableName(u.deanName) === normalizedUser) {
            set.add(u.id);
          }
        }
      }
      managedUnitIds = Array.from(set);
    }

    return {
      id: record.id,
      username: record.username,
      email: record.email ?? buildInstitutionalEmail(record.username),
      entraOid: record.entraOid ?? null,
      authProvider: record.authProvider ?? 'hybrid',
      fullName: record.fullName,
      role: record.role,
      unitId: record.unitId,
      unitName: record.unitId ? (unitsContext.unitNameById.get(record.unitId) ?? null) : null,
      ...(managedUnitIds ? { managedUnitIds } : {}),
      mustChangePassword: record.mustChangePassword,
      isActive: record.isActive,
      passwordChangedAt: record.passwordChangedAt,
      lastLoginAt: record.lastLoginAt ?? null,
      updatedAt: record.updatedAt,
    };
  }

  private async buildUnitsContext(db: DbExecutor): Promise<{
    unitNameById: Map<string, string>;
    units: AcademicUnitRecord[];
  }> {
    const units = await this.repos.units.listAll(db);
    return {
      unitNameById: new Map(units.map((u) => [u.id, u.name])),
      units,
    };
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

  /**
   * Idempotent and non-destructive bootstrap check executed on server start:
   * inserts missing official accounts without overwriting admin edits to usernames,
   * emails, roles, active status, or unit Deans.
   */
  public async ensureDefaultUsersSeeded(): Promise<number> {
    return this.tx.run(async (trx) => {
      const units = await this.repos.units.listAll(trx);
      const existingCount = await this.repos.users.count(trx);
      if (existingCount === 0) {
        const seedUsers = buildDefaultSeedUsers(units);
        await this.repos.users.insertMany(trx, seedUsers);
        return seedUsers.length;
      }

      for (const legacyId of ['user-research', 'user-dean-lic-infantil']) {
        const legacyUser = await this.repos.users.findById(trx, legacyId, { forUpdate: true });
        if (
          legacyUser &&
          legacyUser.passwordChangedAt === null &&
          legacyUser.lastLoginAt === null
        ) {
          await trx.deleteFrom('users').where('id', '=', legacyId).execute();
        }
      }

      const nowIso = new Date().toISOString();
      const unitById = new Map(units.map((u) => [u.id, u]));
      let insertedCount = 0;

      for (const official of OFFICIAL_INSTITUTIONAL_ACCOUNTS) {
        if (official.unitId && !unitById.has(official.unitId)) {
          continue;
        }
        const existingById = await this.repos.users.findById(trx, official.id);
        if (existingById) continue;
        const existingByUsername = await this.repos.users.findByUsername(
          trx,
          official.username,
        );
        if (existingByUsername) continue;

        await this.repos.users.insertMany(trx, [
          {
            id: official.id,
            username: official.username,
            email: official.email,
            entraOid: null,
            authProvider: 'hybrid',
            passwordHash: official.passwordHash,
            fullName: official.fullName,
            role: official.role,
            unitId: official.unitId,
            mustChangePassword: true,
            isActive: true,
            passwordChangedAt: null,
            lastLoginAt: null,
            updatedAt: nowIso,
          },
        ]);
        insertedCount++;
      }

      return insertedCount;
    });
  }

  public async login(dto: LoginDto): Promise<AuthSessionResponse> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.allowLocalLogin) {
      throw new UnauthorizedError(
        `El acceso con contraseña local está deshabilitado. Ingrese con su cuenta institucional de Microsoft (@${authConfig.microsoftEntra.institutionalDomain}).`,
      );
    }

    const db = this.tx.executor;
    const rawIdentifier = dto.username.trim().toLowerCase();
    const username = sanitizeUsernameInput(rawIdentifier);
    if (!username || !dto.password) {
      throw new BadRequestError('Ingrese su usuario institucional y su contraseña.');
    }

    let userRecord = await this.repos.users.findByUsername(db, username);
    if (!userRecord && rawIdentifier.includes('@')) {
      userRecord = await this.repos.users.findByEmail(db, rawIdentifier);
    }
    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError(
        'Usuario o contraseña incorrectos. Verifique su usuario o correo institucional e intente nuevamente.',
      );
    }

    const valid = verifyPassword(dto.password, userRecord.passwordHash);
    if (!valid) {
      throw new UnauthorizedError(
        'Usuario o contraseña incorrectos. Verifique sus credenciales e intente nuevamente.',
      );
    }

    const nowIso = new Date().toISOString();
    const updatedRecord: UserRecord = {
      ...userRecord,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
    };
    await this.repos.users.update(db, updatedRecord);

    const unitsCtx = await this.buildUnitsContext(db);
    const user = this.toAuthUser(updatedRecord, unitsCtx);
    const token = signAuthToken(user);
    return { token, user };
  }

  public async loginWithMicrosoft(dto: MicrosoftLoginDto): Promise<AuthSessionResponse> {
    const rawToken = (dto.idToken || dto.accessToken || '').trim();
    if (!rawToken) {
      throw new BadRequestError(
        'No se recibieron las credenciales de autenticación de Microsoft. Intente iniciar sesión de nuevo.',
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
          `La cuenta institucional ${verified.email} fue autenticada por Microsoft, pero aún no tiene un perfil habilitado en Prenómina. Solicite la activación a la Dirección de Enseñanza y Aprendizaje.`,
        );
      }

      const nowIso = new Date().toISOString();
      const firstTimeEntraLink = existing.entraOid !== verified.entraOid;
      const updated: UserRecord = {
        ...existing,
        email: verified.email,
        entraOid: verified.entraOid,
        authProvider:
          existing.authProvider === 'local' ? 'hybrid' : (existing.authProvider ?? 'hybrid'),
        mustChangePassword: false,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);

      const unitsCtx = await this.buildUnitsContext(trx);
      if (firstTimeEntraLink) {
        const periodCode = await this.periodContext.resolvePeriod(trx);
        const unitName = updated.unitId
          ? (unitsCtx.unitNameById.get(updated.unitId) ?? 'Institucional')
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
            action: 'Vinculación de cuenta institucional Microsoft',
            previousValue: existing.entraOid ? 'Cuenta vinculada previamente' : 'Acceso local',
            newValue: verified.email,
            reason: 'Ingreso con correo institucional de la Universidad Santo Tomás',
          },
        );
      }

      const user = this.toAuthUser(updated, unitsCtx);
      const token = signAuthToken(user);
      return { token, user };
    });
  }

  public async getMe(userId: string): Promise<AuthUser> {
    const db = this.tx.executor;
    const userRecord = await this.repos.users.findById(db, userId);
    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError('La cuenta asociada a esta sesión ya no se encuentra activa.');
    }
    const unitsCtx = await this.buildUnitsContext(db);
    return this.toAuthUser(userRecord, unitsCtx);
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthSessionResponse> {
    const currentPassword = dto.currentPassword ?? '';
    const newPassword = dto.newPassword ?? '';

    if (newPassword.length < 8) {
      throw new BadRequestError('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new BadRequestError(
        'La nueva contraseña debe incluir al menos una letra y un número.',
      );
    }
    if (newPassword === currentPassword) {
      throw new BadRequestError(
        'La nueva contraseña debe ser diferente a la contraseña actual.',
      );
    }

    return this.tx.run(async (trx) => {
      const existing = await this.repos.users.findById(trx, userId, { forUpdate: true });
      if (!existing || !existing.isActive) {
        throw new UnauthorizedError('La cuenta de usuario no existe o se encuentra inactiva.');
      }

      if (!verifyPassword(currentPassword, existing.passwordHash)) {
        throw new UnauthorizedError(
          'La contraseña actual ingresada no es correcta.',
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
      const unitsCtx = await this.buildUnitsContext(trx);
      const unitName = updated.unitId
        ? (unitsCtx.unitNameById.get(updated.unitId) ?? 'Institucional')
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
          action: existing.mustChangePassword
            ? 'Activación de Contraseña Personal'
            : 'Actualización de Contraseña Personal',
          previousValue: existing.mustChangePassword
            ? 'Contraseña temporal inicial'
            : 'Contraseña personal anterior',
          newValue: `Cuenta activada (${updated.username})`,
          reason: existing.mustChangePassword
            ? 'Activación de cuenta en el primer ingreso'
            : 'Actualización voluntaria de contraseña',
        },
      );

      const user = this.toAuthUser(updated, unitsCtx);
      const token = signAuthToken(user);
      return { token, user };
    });
  }

  public async listUsers(): Promise<AuthUser[]> {
    const db = this.tx.executor;
    const [records, unitsCtx] = await Promise.all([
      this.repos.users.listAll(db),
      this.buildUnitsContext(db),
    ]);
    return records.map((r) => this.toAuthUser(r, unitsCtx));
  }

  public async createUser(
    actor: ActorContext,
    dto: CreateUserAccountDto,
  ): Promise<ResetUserPasswordResponse> {
    const username = sanitizeUsernameInput(dto.username);
    if (!USERNAME_PATTERN.test(username)) {
      throw new BadRequestError(
        'El usuario debe tener entre 3 y 60 caracteres (letras minúsculas, números, punto o guion, sin incluir el dominio).',
      );
    }
    const temporaryPassword = dto.temporaryPassword?.trim() || generateSecureTemporaryPassword();
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
        throw new ConflictError(`El usuario '${username}' ya se encuentra registrado.`);
      }

      if (dto.unitId) {
        const unit = await this.repos.units.findById(trx, dto.unitId);
        if (!unit) {
          throw new NotFoundError('La unidad académica seleccionada no existe.');
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
      const unitsCtx = await this.buildUnitsContext(trx);
      const unitName = record.unitId
        ? (unitsCtx.unitNameById.get(record.unitId) ?? 'Institucional')
        : 'Dirección Institucional';
      const roleLabel =
        record.role === 'director'
          ? 'Dirección de Enseñanza y Aprendizaje'
          : record.role === 'vice_rector'
            ? 'Vicerrectoría Académica'
            : record.role === 'research'
              ? 'Dirección de Investigación'
              : 'Decanatura o Dirección de Unidad';

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: record.unitId,
        unitName,
        action: 'Creación de cuenta institucional',
        newValue: `${record.fullName} (${record.username} · ${roleLabel})`,
        reason: 'Asignación de credenciales temporales para primer ingreso',
      });

      return {
        user: this.toAuthUser(record, unitsCtx),
        temporaryPassword,
      };
    });
  }

  public async resetPasswordToTemporary(
    actor: ActorContext,
    dto: ResetUserPasswordDto,
  ): Promise<ResetUserPasswordResponse> {
    const temporaryPassword = dto.temporaryPassword?.trim() || generateSecureTemporaryPassword();
    if (temporaryPassword.length < 6) {
      throw new BadRequestError(
        'La contraseña temporal debe tener al menos 6 caracteres.',
      );
    }

    return this.tx.run(async (trx) => {
      const existing = await this.repos.users.findById(trx, dto.id, { forUpdate: true });
      if (!existing) {
        throw new NotFoundError('La cuenta de usuario seleccionada no existe.');
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
      const unitsCtx = await this.buildUnitsContext(trx);
      const unitName = updated.unitId
        ? (unitsCtx.unitNameById.get(updated.unitId) ?? 'Institucional')
        : 'Dirección Institucional';

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: updated.unitId,
        unitName,
        action: 'Restablecimiento de Contraseña Temporal',
        previousValue: updated.username,
        newValue: 'Contraseña temporal activa para el próximo ingreso',
        reason: `Restablecimiento autorizado por ${actor.name}`,
      });

      return {
        user: this.toAuthUser(updated, unitsCtx),
        temporaryPassword,
      };
    });
  }

  public async deactivateExclusiveDeanForDeletedUnit(
    trx: DbExecutor,
    unitId: string,
  ): Promise<void> {
    const deanRecord = await this.repos.users.findByUnitId(trx, unitId, { forUpdate: true });
    if (!deanRecord) return;
    const allUnits = await this.repos.units.listAll(trx);
    const normalizedDean = normalizeComparableName(deanRecord.fullName);
    const otherManagedUnit = allUnits.find(
      (u) => u.id !== unitId && normalizeComparableName(u.deanName) === normalizedDean,
    );
    const nowIso = new Date().toISOString();
    if (otherManagedUnit) {
      await this.repos.users.update(trx, {
        ...deanRecord,
        unitId: otherManagedUnit.id,
        updatedAt: nowIso,
      });
    } else {
      await this.repos.users.update(trx, {
        ...deanRecord,
        unitId: null,
        isActive: false,
        updatedAt: nowIso,
      });
    }
  }

  /**
   * Synchronizes or provisions the Dean user account inside an ongoing unit/dean transaction.
   * Returns `temporaryPassword` ONLY when a new account was provisioned or its password was reset.
   */
  public async syncUnitDeanUserInTransaction(
    trx: DbExecutor,
    unit: { id: string; name: string; deanName: string },
    options?: { username?: string; temporaryPassword?: string },
  ): Promise<{ user: AuthUser; temporaryPassword?: string }> {
    const existingForUnit = await this.repos.users.findByUnitId(trx, unit.id, {
      forUpdate: true,
    });
    const desiredBase =
      (options?.username ? sanitizeUsernameInput(options.username) : '') ||
      AcademicOrganizationDomain.deriveUsernameFromFullName(unit.deanName);
    const explicitPassword = options?.temporaryPassword?.trim();
    const generatedPassword = explicitPassword || generateSecureTemporaryPassword();
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
        normalizeComparableName(existingForUnit.fullName) !==
        normalizeComparableName(unit.deanName);
      const shouldUpdateUsername = Boolean(options?.username?.trim()) || deanChanged;
      const nextUsername = shouldUpdateUsername
        ? await resolveUniqueUsername(desiredBase, existingForUnit.id)
        : existingForUnit.username;
      const shouldResetPassword = Boolean(explicitPassword) || deanChanged;

      const updated: UserRecord = {
        ...existingForUnit,
        username: nextUsername,
        email: shouldUpdateUsername
          ? buildInstitutionalEmail(nextUsername)
          : (existingForUnit.email ?? buildInstitutionalEmail(nextUsername)),
        entraOid: deanChanged ? null : existingForUnit.entraOid,
        authProvider: existingForUnit.authProvider ?? 'hybrid',
        fullName: unit.deanName.trim(),
        isActive: true,
        passwordHash: shouldResetPassword
          ? hashPassword(generatedPassword)
          : existingForUnit.passwordHash,
        mustChangePassword: shouldResetPassword
          ? true
          : existingForUnit.mustChangePassword,
        passwordChangedAt: shouldResetPassword ? null : existingForUnit.passwordChangedAt,
        updatedAt: nowIso,
      };
      await this.repos.users.update(trx, updated);
      const unitsCtx = await this.buildUnitsContext(trx);
      return {
        user: this.toAuthUser(updated, unitsCtx),
        ...(shouldResetPassword ? { temporaryPassword: generatedPassword } : {}),
      };
    }

    // Multi-unit Dean support: if an active Dean already matches fullName and no custom username was requested, reuse their account!
    if (!options?.username?.trim()) {
      const allUsers = await this.repos.users.listAll(trx);
      const normalizedTarget = normalizeComparableName(unit.deanName);
      const matchingMultiUnitDean = allUsers.find(
        (u) =>
          u.role === 'dean' &&
          u.isActive &&
          normalizeComparableName(u.fullName) === normalizedTarget,
      );
      if (matchingMultiUnitDean) {
        let finalRecord = matchingMultiUnitDean;
        if (explicitPassword) {
          finalRecord = {
            ...matchingMultiUnitDean,
            passwordHash: hashPassword(generatedPassword),
            mustChangePassword: true,
            passwordChangedAt: null,
            updatedAt: nowIso,
          };
          await this.repos.users.update(trx, finalRecord);
        }
        const unitsCtx = await this.buildUnitsContext(trx);
        return {
          user: this.toAuthUser(finalRecord, unitsCtx),
          ...(explicitPassword ? { temporaryPassword: generatedPassword } : {}),
        };
      }
    }

    const uniqueUsername = await resolveUniqueUsername(desiredBase);
    const candidateId = `user-dean-${unit.id}`;
    const existingWithId = await this.repos.users.findById(trx, candidateId);
    const created: UserRecord = {
      id: existingWithId ? `user-dean-${this.ids.next()}` : candidateId,
      username: uniqueUsername,
      email: buildInstitutionalEmail(uniqueUsername),
      entraOid: null,
      authProvider: 'hybrid',
      passwordHash: hashPassword(generatedPassword),
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
    const unitsCtx = await this.buildUnitsContext(trx);
    return {
      user: this.toAuthUser(created, unitsCtx),
      temporaryPassword: generatedPassword,
    };
  }
}
