import type {
  AcademicPeriod,
  FacultyTeacher,
  IdGenerator,
  SchedulePhase,
} from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
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

export const DEFAULT_SCHEDULE_PHASES_SEED: SchedulePhase[] = [
  {
    id: 'fase-1',
    label: 'Fase 1',
    title: 'Parametrización ANEXOS 4–7',
    dateRange: 'Por programar',
    status: 'Activa',
  },
  {
    id: 'fase-2',
    label: 'Fase 2',
    title: 'Diligenciamiento y ANEXO 3',
    dateRange: 'Por programar',
    status: 'Programada',
  },
  {
    id: 'fase-3',
    label: 'Fase 3',
    title: 'Jornadas Revisión E&A + TH',
    dateRange: 'Por programar',
    status: 'Programada',
  },
  {
    id: 'fase-4',
    label: 'Fase 4',
    title: 'Cargue SAC y Auditoría',
    dateRange: 'Por programar',
    status: 'Programada',
  },
];

export interface SeedOptions {
  forceTruncate?: boolean;
  overridePasswordHash?: string;
}

export interface SeedResult {
  seeded: boolean;
  source: 'ts-seed' | 'synced';
}

const LEGACY_DEMO_APPROVAL_IDS = ['aval-1', 'aval-2', 'aval-3', 'aval-4'] as const;
const LEGACY_DEMO_RESEARCH_IDS = ['inv-1', 'inv-2', 'inv-3', 'inv-4', 'inv-5'] as const;
const LEGACY_DEMO_AUDIT_IDS = ['b-1', 'b-2', 'b-3'] as const;
const LEGACY_DEMO_CLOSED_PERIODS = ['2026-1', '2025-2'] as const;

async function cleanupAndSyncExistingDatabase(
  trx: DbExecutor,
  repos: Repositories,
  options?: SeedOptions,
): Promise<void> {
  // 1. Purge legacy demo Annex 3 approvals, Annex 7 research rows, and demo audit logs
  await trx
    .deleteFrom('approval_requests')
    .where('id', 'in', [...LEGACY_DEMO_APPROVAL_IDS])
    .execute();
  await trx
    .deleteFrom('research_allocations')
    .where('id', 'in', [...LEGACY_DEMO_RESEARCH_IDS])
    .execute();
  await trx
    .deleteFrom('audit_logs')
    .where('id', 'in', [...LEGACY_DEMO_AUDIT_IDS])
    .execute();

  // 2. Purge empty closed demo periods ('2026-1', '2025-2') if they have no teachers
  for (const periodCode of LEGACY_DEMO_CLOSED_PERIODS) {
    const teacherInPeriod = await trx
      .selectFrom('teachers')
      .select('id')
      .where('period_code', '=', periodCode)
      .limit(1)
      .executeTakeFirst();
    if (!teacherInPeriod) {
      await trx.deleteFrom('academic_periods').where('code', '=', periodCode).execute();
    }
  }

  // 3. Sync official Deans and institutional user accounts (removing unused legacy derived accounts)
  const existingUnits = await repos.units.listAll(trx);
  const existingUsers = await repos.users.count(trx);
  if (existingUsers === 0) {
    await repos.users.insertMany(
      trx,
      buildDefaultSeedUsers(existingUnits, options?.overridePasswordHash),
    );
  } else {
    for (const legacyId of ['user-research', 'user-dean-lic-infantil']) {
      const legacyUser = await repos.users.findById(trx, legacyId, { forUpdate: true });
      if (
        legacyUser &&
        legacyUser.passwordChangedAt === null &&
        legacyUser.lastLoginAt === null
      ) {
        await trx.deleteFrom('users').where('id', '=', legacyId).execute();
      }
    }

    const nowIso = new Date().toISOString();
    const unitById = new Map(existingUnits.map((u) => [u.id, u]));
    const licInfantil = unitById.get('lic-infantil');
    if (licInfantil && licInfantil.deanName === 'Yolanda Patricia Fonseca Arias') {
      await repos.units.update(trx, {
        ...licInfantil,
        deanName: 'Gladys Leonor Arias Rodríguez',
      });
    }

    for (const official of OFFICIAL_INSTITUTIONAL_ACCOUNTS) {
      if (official.unitId) {
        const unit = unitById.get(official.unitId);
        if (unit && unit.deanName !== official.fullName) {
          await repos.units.update(trx, { ...unit, deanName: official.fullName });
        }
      }

      const existingById = await repos.users.findById(trx, official.id, {
        forUpdate: true,
      });
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
            ? (options?.overridePasswordHash ?? official.passwordHash)
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
            passwordHash: options?.overridePasswordHash ?? official.passwordHash,
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

  // 4. Replace stale former Deans on Directivo teacher rows if untouched
  const ind1 = await trx
    .selectFrom('teachers')
    .select(['id', 'document_id'])
    .where('id', '=', 'ind-1')
    .executeTakeFirst();
  if (ind1 && ind1.document_id === '37274697') {
    await trx
      .updateTable('teachers')
      .set({
        document_id: '74382158',
        full_name: 'JUAN CAMILO ERNESTO VALDERRAMA BALAGUERA',
        academic_rank: 'Decano(a) de Facultad',
        education: 'Ingeniero Industrial · Magíster en Ingeniería',
        shared_hours: null,
        shared_unit_name: null,
        general_note: null,
        version1_total: null,
      })
      .where('id', '=', 'ind-1')
      .execute();
    await trx.deleteFrom('teacher_code_allocations').where('teacher_id', '=', 'ind-1').execute();
    await trx
      .insertInto('teacher_code_allocations')
      .values({
        teacher_id: 'ind-1',
        code: '30222',
        hours: 190,
        version1_hours: null,
        unit_count: null,
        exception_justification: null,
        director_note: null,
        adjusted_by_director: null,
      })
      .execute();
  }

  const derecho2 = await trx
    .selectFrom('teachers')
    .select(['id', 'document_id'])
    .where('id', '=', 'derecho-2')
    .executeTakeFirst();
  if (derecho2 && derecho2.document_id === '1049621815') {
    await trx
      .updateTable('teachers')
      .set({
        document_id: '1057515000',
        full_name: 'CARLOS ANDRÉS ARANDA CAMACHO',
        academic_rank: 'Decano(a) de Facultad',
        education: 'Abogado · Magíster en Derecho',
        general_note: null,
        version1_total: null,
      })
      .where('id', '=', 'derecho-2')
      .execute();
    await trx
      .deleteFrom('teacher_academic_spaces')
      .where('teacher_id', '=', 'derecho-2')
      .where('id', '=', 'derecho-2-esp-1')
      .execute();
    await trx
      .deleteFrom('teacher_code_allocations')
      .where('teacher_id', '=', 'derecho-2')
      .execute();
    await trx
      .insertInto('teacher_code_allocations')
      .values({
        teacher_id: 'derecho-2',
        code: '30222',
        hours: 190,
        version1_hours: null,
        unit_count: null,
        exception_justification: null,
        director_note: null,
        adjusted_by_director: null,
      })
      .execute();
  }

  await trx
    .updateTable('teachers')
    .set({ full_name: 'GLADYS LEONOR ARIAS RODRÍGUEZ' })
    .where('id', '=', 'lic-lenguas-2')
    .where('full_name', '=', 'GLADIS LEONOR ARIAS RODRIGUEZ')
    .execute();

  // 5. Check if any real operational audit logs exist (excluding auth/password events)
  const realOperationalAudit = await trx
    .selectFrom('audit_logs')
    .select('id')
    .where('action', 'not like', '%Contraseña%')
    .where('action', 'not like', '%Microsoft Entra%')
    .limit(1)
    .executeTakeFirst();

  if (!realOperationalAudit) {
    // Strip simulated v1/v2 demo notes and reset unit statuses to clean 'Borrador' v1
    await trx
      .updateTable('teachers')
      .set({ general_note: null, version1_total: null })
      .execute();
    await trx
      .updateTable('teacher_code_allocations')
      .set({
        version1_hours: null,
        director_note: null,
        adjusted_by_director: null,
        exception_justification: null,
      })
      .execute();
    await trx
      .updateTable('unit_payroll_cycles')
      .set({ payroll_status: 'Borrador', current_version: 1 })
      .where('period_code', '=', '2026-2')
      .execute();
  }

  // 6. Sync clean official SAC descriptions/guidelines if untouched in audit trail
  const sacEditedAudit = await trx
    .selectFrom('audit_logs')
    .select('id')
    .where('unit_name', '=', 'Catálogo Institucional SAC (ANEXO 4)')
    .limit(1)
    .executeTakeFirst();
  if (!sacEditedAudit) {
    const seed = await import('./usta-seed.data.js');
    for (const cleanCode of seed.SAC_CODES_ANNEX4_SEED) {
      await trx
        .updateTable('sac_codes')
        .set({
          name: cleanCode.name,
          definition: cleanCode.definition,
          guideline: cleanCode.guideline,
        })
        .where('code', '=', cleanCode.code)
        .execute();
    }
  }

  // 7. Sync schedule phases if untouched in audit trail
  const scheduleEditedAudit = await trx
    .selectFrom('audit_logs')
    .select('id')
    .where('unit_name', '=', 'Cronograma Semestral de Prenómina')
    .limit(1)
    .executeTakeFirst();
  if (!scheduleEditedAudit) {
    for (const phase of DEFAULT_SCHEDULE_PHASES_SEED) {
      await repos.schedulePhases.update(trx, phase);
    }
  }
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
      await cleanupAndSyncExistingDatabase(trx, repos, options);
      return { seeded: false, source: 'synced' };
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

    const seed = await import('./usta-seed.data.js');
    const activePeriod = '2026-2';
    const nowIso = new Date().toISOString();

    const periods: AcademicPeriod[] = [
      {
        code: activePeriod,
        name: `Periodo Académico ${activePeriod} — Seccional Tunja`,
        status: 'ABIERTO',
        isCurrent: true,
        openedAt: nowIso,
        closedAt: null,
      },
    ];

    await repos.periods.insertMany(trx, periods);
    await repos.businessRules.save(
      trx,
      activePeriod,
      { ...DEFAULT_BUSINESS_RULES },
      'Sistema (Semilla Inicial)',
    );
    await repos.schedulePhases.insertMany(trx, activePeriod, DEFAULT_SCHEDULE_PHASES_SEED);

    const unitRecords: AcademicUnitRecord[] = seed.ACADEMIC_UNITS_SEED.map((u) => ({
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

    const unitCycles: UnitPayrollCycle[] = seed.ACADEMIC_UNITS_SEED.map((u) => ({
      unitId: u.id,
      periodCode: activePeriod,
      payrollStatus: 'Borrador',
      currentVersion: 1,
      updatedAt: nowIso,
    }));
    await repos.units.saveCycles(trx, unitCycles);

    const programRecords: AcademicProgramRecord[] = seed.PROGRAM_QUOTAS_ANNEX5_SEED.map(
      ({ unitName: _unitName, ...program }) => program,
    );
    await repos.programs.insertMany(trx, programRecords);

    await repos.sacCodes.insertMany(trx, structuredClone(seed.SAC_CODES_ANNEX4_SEED));

    const seenUnitDoc = new Set<string>();
    const seenSpaceIds = new Set<string>();
    const sanitizedTeachers: FacultyTeacher[] = structuredClone(
      seed.FACULTY_TEACHERS_SEED,
    ).map((teacher, idx) => {
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

    return { seeded: true, source: 'ts-seed' };
  });
}
