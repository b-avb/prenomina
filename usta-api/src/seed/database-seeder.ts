import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AcademicPeriod,
  FacultyTeacher,
  IdGenerator,
  SchedulePhase,
} from '@usta/domain';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { AuditLogRecord } from '../models/audit.models.js';
import type {
  AcademicProgramRecord,
  AcademicUnitRecord,
  UnitPayrollCycle,
} from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import {
  buildDefaultSeedUsers,
  OFFICIAL_INSTITUTIONAL_ACCOUNTS,
} from '../services/auth.service.js';
import { DEFAULT_BUSINESS_RULES } from '../services/period-context.service.js';
import {
  normalizePersistedState,
  type LegacyImportedState,
} from '../utils/state-migrator.utils.js';

export const DEFAULT_SCHEDULE_PHASES_SEED: SchedulePhase[] = [
  {
    id: 'fase-1',
    label: 'Fase 1',
    title: 'Parametrización ANEXOS 4–7',
    dateRange: '26 Jun – 30 Jun',
    status: 'Completada',
  },
  {
    id: 'fase-2',
    label: 'Fase 2',
    title: 'Diligenciamiento y ANEXO 3',
    dateRange: '01 Jul – 05 Jul',
    status: 'Completada',
  },
  {
    id: 'fase-3',
    label: 'Fase 3 · Activa',
    title: 'Jornadas Revisión E&A + TH',
    dateRange: '06 Jul – 09 Jul',
    status: 'Activa',
  },
  {
    id: 'fase-4',
    label: 'Fase 4',
    title: 'Cargue SAC y Auditoría',
    dateRange: '13 Jul – 15 Jul',
    status: 'Programada',
  },
];

export interface SeedOptions {
  forceTruncate?: boolean;
  preferJsonSnapshot?: boolean;
  jsonPath?: string;
  overridePasswordHash?: string;
}

export interface SeedResult {
  seeded: boolean;
  source: 'json' | 'ts-seed' | 'skipped';
}

function resolveDefaultJsonPath(): string {
  const fromCwd = path.resolve(process.cwd(), 'data/prenomina-state.json');
  if (fs.existsSync(fromCwd)) return fromCwd;
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, '../../data/prenomina-state.json');
}

async function loadLegacySeedState(options?: SeedOptions): Promise<{
  state: LegacyImportedState;
  source: 'json' | 'ts-seed';
}> {
  const preferJson = options?.preferJsonSnapshot !== false;
  const jsonPath = options?.jsonPath ?? resolveDefaultJsonPath();

  if (preferJson && fs.existsSync(jsonPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as Record<string, unknown>;
    return {
      state: normalizePersistedState(raw),
      source: 'json',
    };
  }

  const seed = await import('./usta-seed.data.js');
  return {
    source: 'ts-seed',
    state: {
      activePeriod: '2026-2',
      availablePeriods: ['2026-2', '2026-1', '2025-2'],
      schedulePhases: DEFAULT_SCHEDULE_PHASES_SEED,
      rulesConfig: { ...DEFAULT_BUSINESS_RULES },
      sacCodes: structuredClone(seed.SAC_CODES_ANNEX4_SEED),
      units: structuredClone(seed.ACADEMIC_UNITS_SEED),
      programQuotas: structuredClone(seed.PROGRAM_QUOTAS_ANNEX5_SEED),
      teachers: structuredClone(seed.FACULTY_TEACHERS_SEED),
      approvalRequests: structuredClone(seed.APPROVAL_REQUESTS_ANNEX3_SEED),
      researchAllocations: structuredClone(seed.RESEARCH_ALLOCATIONS_ANNEX7_SEED),
      auditLogs: structuredClone(seed.INITIAL_AUDIT_LOGS_SEED),
      updatedAt: new Date().toISOString(),
    },
  };
}

function parseTimestampOrNow(value: string | undefined): Date {
  if (!value) return new Date();
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}:00Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function seedDatabaseWithOfficialData(
  tx: TransactionRunner,
  repos: Repositories,
  ids: IdGenerator,
  options?: SeedOptions,
): Promise<SeedResult> {
  return tx.run(async (trx) => {
    const existingUnitCount = await repos.units.count(trx);
    if (existingUnitCount > 0 && !options?.forceTruncate) {
      const existingUnits = await repos.units.listAll(trx);
      const existingUsers = await repos.users.count(trx);
      if (existingUsers === 0) {
        await repos.users.insertMany(
          trx,
          buildDefaultSeedUsers(existingUnits, options?.overridePasswordHash),
        );
      } else {
        const nowIso = new Date().toISOString();
        const unitById = new Map(existingUnits.map((u) => [u.id, u]));
        for (const official of OFFICIAL_INSTITUTIONAL_ACCOUNTS) {
          if (official.unitId) {
            const unit = unitById.get(official.unitId);
            if (unit && unit.deanName !== official.fullName) {
              await repos.units.update(trx, { ...unit, deanName: official.fullName });
            }
          }
          const existingById = await repos.users.findById(trx, official.id, { forUpdate: true });
          if (existingById) {
            const hasNotChangedPassword = existingById.passwordChangedAt === null;
            await repos.users.update(trx, {
              ...existingById,
              username: official.username,
              email: official.email,
              fullName: official.fullName,
              role: official.role,
              unitId: official.unitId,
              isActive: true,
              passwordHash: hasNotChangedPassword
                ? official.passwordHash
                : existingById.passwordHash,
              mustChangePassword: hasNotChangedPassword ? true : existingById.mustChangePassword,
              updatedAt: nowIso,
            });
          } else {
            await repos.users.insertMany(trx, [
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
          }
        }
      }
      return { seeded: false, source: 'skipped' };
    }

    if (options?.forceTruncate) {
      await trx.deleteFrom('audit_logs').execute();
      await trx.deleteFrom('research_allocations').execute();
      await trx.deleteFrom('approval_request_projects').execute();
      await trx.deleteFrom('approval_requests').execute();
      await trx.deleteFrom('teacher_code_allocations').execute();
      await trx.deleteFrom('teacher_academic_spaces').execute();
      await trx.deleteFrom('teachers').execute();
      await trx.deleteFrom('sac_faculty_rules').execute();
      await trx.deleteFrom('sac_codes').execute();
      await trx.deleteFrom('academic_programs').execute();
      await trx.deleteFrom('unit_payroll_cycles').execute();
      await trx.deleteFrom('users').execute();
      await trx.deleteFrom('academic_units').execute();
      await trx.deleteFrom('schedule_phases').execute();
      await trx.deleteFrom('business_rules').execute();
      await trx.deleteFrom('academic_periods').execute();
    }

    const { state, source } = await loadLegacySeedState(options);
    const activePeriod = state.activePeriod || '2026-2';
    const periodCodes = Array.from(
      new Set([activePeriod, ...(state.availablePeriods ?? []), '2026-2']),
    );
    const nowIso = new Date().toISOString();

    const periods: AcademicPeriod[] = periodCodes.map((code) => ({
      code,
      name: `Periodo Académico ${code} — Seccional Tunja`,
      status: code === activePeriod ? 'ABIERTO' : 'CERRADO_SAC',
      isCurrent: code === activePeriod,
      openedAt: nowIso,
      closedAt: code === activePeriod ? null : nowIso,
    }));

    await repos.periods.insertMany(trx, periods);
    await repos.businessRules.save(
      trx,
      activePeriod,
      state.rulesConfig ?? DEFAULT_BUSINESS_RULES,
      'Sistema (Semilla Inicial)',
    );

    const phases =
      state.schedulePhases && state.schedulePhases.length > 0
        ? state.schedulePhases
        : DEFAULT_SCHEDULE_PHASES_SEED;
    await repos.schedulePhases.insertMany(trx, activePeriod, phases);

    const unitRecords: AcademicUnitRecord[] = state.units.map((u) => ({
      id: u.id,
      name: u.name,
      division: u.division,
      unitType: u.unitType,
      hasPostgraduates: u.hasPostgraduates,
      deanName: u.deanName,
      qualityCap30411: u.qualityCap30411,
      curriculumCap40106: u.curriculumCap40106,
      seaCap40109: u.seaCap40109,
      saberProCap40127: u.saberProCap40127,
      graduatesCap20502: u.graduatesCap20502,
      updatedAt: u.updatedAt || nowIso,
    }));
    await repos.units.insertMany(trx, unitRecords);
    await repos.users.insertMany(
      trx,
      buildDefaultSeedUsers(unitRecords, options?.overridePasswordHash),
    );

    const unitCycles: UnitPayrollCycle[] = state.units.map((u) => ({
      unitId: u.id,
      periodCode: activePeriod,
      payrollStatus: u.payrollStatus,
      currentVersion: u.currentVersion || 1,
      updatedAt: u.updatedAt || nowIso,
    }));
    await repos.units.saveCycles(trx, unitCycles);

    const programRecords: AcademicProgramRecord[] = state.programQuotas.map(
      ({ unitName: _unitName, ...program }) => program,
    );
    await repos.programs.insertMany(trx, programRecords);

    await repos.sacCodes.insertMany(trx, state.sacCodes);

    const seenUnitDoc = new Set<string>();
    const seenSpaceIds = new Set<string>();
    const sanitizedTeachers: FacultyTeacher[] = state.teachers.map((teacher, idx) => {
      let documentId = teacher.documentId || `DOC-${idx + 1}`;
      const docKey = `${teacher.unitId}:${documentId}`;
      if (seenUnitDoc.has(docKey)) {
        documentId = `${documentId}-${teacher.id}`;
      }
      seenUnitDoc.add(`${teacher.unitId}:${documentId}`);

      const academicSpaces = teacher.academicSpaces.map((space) => {
        let spaceId = space.id || ids.next();
        if (seenSpaceIds.has(spaceId)) {
          spaceId = ids.next();
        }
        seenSpaceIds.add(spaceId);
        return {
          ...space,
          id: spaceId,
        };
      });

      return {
        ...teacher,
        documentId,
        academicSpaces,
      };
    });

    await repos.teachers.insertMany(trx, activePeriod, sanitizedTeachers);

    if (state.approvalRequests.length > 0) {
      await repos.approvals.insertMany(
        trx,
        state.approvalRequests.map((req) => ({
          ...req,
          period: req.period || activePeriod,
        })),
      );
    }

    if (state.researchAllocations.length > 0) {
      await repos.research.insertMany(
        trx,
        state.researchAllocations.map((alloc) => ({
          ...alloc,
          period: alloc.period || activePeriod,
        })),
      );
    }

    if (state.auditLogs.length > 0) {
      const unitIdByName = new Map(state.units.map((u) => [u.name, u.id]));
      const auditRecords: AuditLogRecord[] = state.auditLogs.map((entry) => ({
        id: entry.id || ids.next(),
        periodCode: activePeriod,
        unitId: unitIdByName.get(entry.unitName) ?? null,
        unitName: entry.unitName,
        ...(entry.teacherName !== undefined ? { teacherName: entry.teacherName } : {}),
        action: entry.action,
        ...(entry.previousValue !== undefined ? { previousValue: entry.previousValue } : {}),
        ...(entry.newValue !== undefined ? { newValue: entry.newValue } : {}),
        ...(entry.reason !== undefined ? { reason: entry.reason } : {}),
        occurredAt: parseTimestampOrNow(entry.timestamp),
        actorName: entry.user,
        actorRole: entry.role,
      }));
      await repos.auditLogs.insertMany(trx, auditRecords);
    }

    return { seeded: true, source };
  });
}
