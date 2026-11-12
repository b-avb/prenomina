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

/** Baseline four-phase semester schedule seeded for a newly opened academic period. */
export const DEFAULT_SCHEDULE_PHASES_SEED: SchedulePhase[] = [
  {
    id: 'fase-1',
    label: 'Fase 1',
    title: 'Parametrización de Anexos 4 al 7',
    dateRange: 'Por programar',
    status: 'Activa',
  },
  {
    id: 'fase-2',
    label: 'Fase 2',
    title: 'Asignación académica y solicitudes Anexo 3',
    dateRange: 'Por programar',
    status: 'Programada',
  },
  {
    id: 'fase-3',
    label: 'Fase 3',
    title: 'Jornadas de revisión curricular y Talento Humano',
    dateRange: 'Por programar',
    status: 'Programada',
  },
  {
    id: 'fase-4',
    label: 'Fase 4',
    title: 'Consolidación en SAC y cierre',
    dateRange: 'Por programar',
    status: 'Programada',
  },
];

/** Controls destructive truncation and optional pre-computed password hash injection for test harnesses. */
export interface SeedOptions {
  forceTruncate?: boolean;
  overridePasswordHash?: string;
}

/** Reports whether the database was populated from scratch (`ts-seed`) or reconciled in place (`synced`). */
export interface SeedResult {
  seeded: boolean;
  source: 'ts-seed' | 'synced';
}

const LEGACY_DEMO_APPROVAL_IDS = ['aval-1', 'aval-2', 'aval-3', 'aval-4'] as const;
const LEGACY_DEMO_RESEARCH_IDS = ['inv-1', 'inv-2', 'inv-3', 'inv-4', 'inv-5'] as const;
const LEGACY_DEMO_AUDIT_IDS = ['b-1', 'b-2', 'b-3'] as const;
const LEGACY_DEMO_CLOSED_PERIODS = ['2026-1', '2025-2'] as const;

/**
 * Reconciles an already-populated database idempotently on startup: removes synthetic fixture IDs,
 * aligns division and unit titles with Acuerdo No. 48, synchronizes unactivated institutional accounts,
 * and backfills missing catalog or program records without overwriting administrator edits recorded in `audit_logs`.
 */
async function cleanupAndSyncExistingDatabase(
  trx: DbExecutor,
  repos: Repositories,
  options?: SeedOptions,
): Promise<void> {
  // Remove synthetic fixture rows if present from pre-production dumps.
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

  // Prune placeholder closed periods only when no teacher rosters reference them.
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

  // Align unit and division nomenclature with Acuerdo No. 48 and synchronize postgraduate flags.
  await trx
    .updateTable('academic_units')
    .set({ name: 'Dirección de Ciencias Básicas' })
    .where('id', '=', 'ciencias-basicas')
    .where('name', '=', 'Departamento de Ciencias Básicas')
    .execute();
  await trx
    .updateTable('academic_units')
    .set({ name: 'Dirección de Humanidades' })
    .where('id', '=', 'humanidades')
    .where('name', 'in', [
      'Departamento de Humanidades y Formación Integral',
      'Departamento de Humanidades',
    ])
    .execute();
  await trx
    .updateTable('academic_units')
    .set({ division: 'División de Ingenierías y Arquitectura' })
    .where('division', '=', 'División de Arquitectura e Ingenierías')
    .execute();
  await trx
    .updateTable('academic_units')
    .set({ division: 'División de Ciencias Económicas y Administrativas' })
    .where('division', '=', 'División de Ciencias Económicas, Administrativas y Contables')
    .execute();

  const unitsWithActivePostgrad = await trx
    .selectFrom('academic_programs')
    .select('unit_id')
    .where('level', '=', 'Posgrado')
    .where('is_active', '=', 1)
    .distinct()
    .execute();
  if (unitsWithActivePostgrad.length > 0) {
    await trx
      .updateTable('academic_units')
      .set({ has_postgraduates: 1 })
      .where(
        'id',
        'in',
        unitsWithActivePostgrad.map((r) => r.unit_id),
      )
      .execute();
  }

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

    const deanUpdatedAudits = await trx
      .selectFrom('audit_logs')
      .select('unit_id')
      .where('action', 'like', '%Actualización de Decano%')
      .execute();
    const unitsWithEditedDean = new Set(
      deanUpdatedAudits.map((r) => r.unit_id).filter(Boolean),
    );

    const nowIso = new Date().toISOString();
    const unitById = new Map(existingUnits.map((u) => [u.id, u]));
    const licInfantil = unitById.get('lic-infantil');
    if (
      licInfantil &&
      !unitsWithEditedDean.has('lic-infantil') &&
      licInfantil.deanName === 'Yolanda Patricia Fonseca Arias'
    ) {
      await repos.units.update(trx, {
        ...licInfantil,
        deanName: 'Gladys Leonor Arias Rodríguez',
      });
    }

    for (const official of OFFICIAL_INSTITUTIONAL_ACCOUNTS) {
      if (official.unitId && !unitsWithEditedDean.has(official.unitId)) {
        const unit = unitById.get(official.unitId);
        if (unit && unit.deanName !== official.fullName) {
          await repos.units.update(trx, { ...unit, deanName: official.fullName });
        }
      }

      const existingById = await repos.users.findById(trx, official.id, {
        forUpdate: true,
      });
      if (existingById) {
        if (official.unitId && unitsWithEditedDean.has(official.unitId)) {
          continue;
        }
        const notActivatedYet =
          existingById.passwordChangedAt === null &&
          existingById.entraOid === null &&
          existingById.mustChangePassword;
        await repos.users.update(trx, {
          ...existingById,
          username: official.username,
          email: official.email,
          fullName: official.fullName,
          role: official.role,
          unitId: official.unitId,
          isActive: true,
          passwordHash: notActivatedYet
            ? (options?.overridePasswordHash ?? official.passwordHash)
            : existingById.passwordHash,
          mustChangePassword: notActivatedYet ? true : existingById.mustChangePassword,
          updatedAt: nowIso,
        });
      } else {
        const existingByUsername = await repos.users.findByUsername(
          trx,
          official.username,
        );
        if (!existingByUsername) {
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
  }

  // Backfill missing Annex 5 programs unless explicitly deleted in the audit log.
  const seed = await import('./usta-seed.data.js');
  const programDeletedAudits = await trx
    .selectFrom('audit_logs')
    .select('previous_value')
    .where('action', 'like', '%Eliminación de Programa Académico%')
    .execute();
  const deletedProgramNames = new Set(
    programDeletedAudits.map((r) => (r.previous_value ?? '').split(' (')[0]?.trim()),
  );
  const existingPrograms = await repos.programs.list(trx);
  const existingProgramIds = new Set(existingPrograms.map((p) => p.id));
  const existingUnitIds = new Set((await repos.units.listAll(trx)).map((u) => u.id));
  const missingPrograms: AcademicProgramRecord[] = [];
  for (const { unitName: _unitName, ...program } of seed.PROGRAM_QUOTAS_ANNEX5_SEED) {
    if (
      !existingProgramIds.has(program.id) &&
      existingUnitIds.has(program.unitId) &&
      !deletedProgramNames.has(program.programName)
    ) {
      missingPrograms.push(program);
    }
  }
  if (missingPrograms.length > 0) {
    await repos.programs.insertMany(trx, missingPrograms);
  }
  await trx
    .updateTable('academic_programs')
    .set({ is_active: 1 })
    .where('id', '=', 'p-ind-2')
    .where('is_active', '=', 0)
    .execute();
  await trx
    .updateTable('academic_units')
    .set({ sea_cap_40109: 12 })
    .where('id', 'in', ['ing-mecanica', 'ing-ambiental'])
    .where('sea_cap_40109', '=', 8)
    .execute();

  // Reconcile Directivo and vacancy teacher roster entries that still match unedited baseline IDs.
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
        academic_rank: 'Decanatura de Facultad',
        education: 'Ingeniero Industrial · Magíster en Ingeniería',
        shared_hours: null,
        shared_unit_name: null,
        general_note: null,
        version1_total: null,
      })
      .where('id', '=', 'ind-1')
      .execute();
    await trx.deleteFrom('teacher_code_allocations').where('teacher_id', '=', 'ind-1').execute();
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
        academic_rank: 'Decanatura de Facultad',
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
  }

  await trx
    .updateTable('teachers')
    .set({ full_name: 'GLADYS LEONOR ARIAS RODRÍGUEZ' })
    .where('id', '=', 'lic-lenguas-2')
    .where('full_name', '=', 'GLADIS LEONOR ARIAS RODRIGUEZ')
    .execute();

  await trx
    .updateTable('teachers')
    .set({ full_name: 'ORTEGA CELIS PAUL EDUARDO', is_provisional: 0 })
    .where('id', '=', 'ind-10')
    .where('full_name', '=', 'ORTEGA CELIS PAUL EDUARDO (Antes INDUSTRIAL PENDIENTE 1)')
    .execute();

  await trx
    .updateTable('teachers')
    .set({ full_name: 'VACANTE GESTOR VIRTUAL MT' })
    .where('id', '=', 'ind-11')
    .where('full_name', '=', 'INDUSTRIAL PENDIENTE 2 (Gestor Virtual MT)')
    .execute();

  // Remove synthetic academic space rows (`%-esp-%`) carried over from fixture dumps.
  await trx
    .deleteFrom('teacher_academic_spaces')
    .where('id', 'like', '%-esp-%')
    .execute();

  // Reset teacher workloads to zero only when no real workload or workflow mutations exist in `audit_logs`.
  const realWorkloadAudit = await trx
    .selectFrom('audit_logs')
    .select('id')
    .where((eb) =>
      eb.or([
        eb('action', 'like', '%Espacio Académico%'),
        eb('action', 'like', '%Asignación Cód.%'),
        eb('action', 'like', '%Ajuste de Horas PSE%'),
        eb('action', 'like', '%Importación de Planta%'),
        eb('action', 'like', '%Cambio de estado de prenómina%'),
        eb('action', 'like', '%Investigación ANEXO 7%'),
        eb('action', 'like', '%Vinculación de Docente%'),
        eb('action', 'like', '%Actualización de Ficha Docente%'),
      ]),
    )
    .limit(1)
    .executeTakeFirst();

  if (!realWorkloadAudit) {
    await trx.deleteFrom('teacher_code_allocations').execute();
    await trx.deleteFrom('teacher_academic_spaces').execute();
    await trx
      .updateTable('teachers')
      .set({
        pse_manual_override: null,
        shared_hours: null,
        shared_unit_name: null,
        general_note: null,
        version1_total: null,
      })
      .execute();
    await trx
      .updateTable('unit_payroll_cycles')
      .set({ payroll_status: 'Borrador', current_version: 1 })
      .where('period_code', '=', '2026-2')
      .execute();
    for (const seedTeacher of seed.FACULTY_TEACHERS_SEED) {
      await trx
        .updateTable('teachers')
        .set({
          academic_rank: seedTeacher.rank,
          education: seedTeacher.education,
        })
        .where('id', '=', seedTeacher.id)
        .where((eb) =>
          eb.or([
            eb('academic_rank', 'like', '%(a)%'),
            eb('education', 'like', '%(a)%'),
          ]),
        )
        .execute();
    }
  }

  // Refresh Annex 4 SAC catalog descriptions only if no catalog edits are recorded in `audit_logs`.
  const sacEditedAudit = await trx
    .selectFrom('audit_logs')
    .select('id')
    .where('unit_name', '=', 'Catálogo Institucional SAC (ANEXO 4)')
    .limit(1)
    .executeTakeFirst();
  if (!sacEditedAudit) {
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

  // Refresh schedule phase labels only if no schedule edits are recorded in `audit_logs`.
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

/**
 * Seeds the database with institutional baseline data for period `2026-2` when empty (or when
 * `options.forceTruncate` is true); otherwise runs `cleanupAndSyncExistingDatabase` in a transaction.
 */
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
      'Configuración institucional inicial',
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
