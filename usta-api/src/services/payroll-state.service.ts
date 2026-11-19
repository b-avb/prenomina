import type {
  AcademicPeriod,
  ActorContext,
  CreatePeriodDto,
  DeletePeriodResponse,
  FacultyTeacher,
  HealthResponse,
  IdGenerator,
  PayrollSnapshot,
  PeriodCopyMode,
  TeacherCodeAllocation,
} from '@usta/domain';
import { getActorAllowedUnitIds } from '../auth/actor-resolver.js';
import { ENV_CONFIG } from '../config/env.config.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import { seedDatabaseWithOfficialData } from '../seed/database-seeder.js';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

/** Baseline semester protected against administrative deletion. */
const PROTECTED_BASELINE_PERIOD = '2026-2';

/** Maximum number of recent audit entries bundled into a period snapshot payload. */
const SNAPSHOT_AUDIT_LIMIT = 200;

/**
 * Orchestrates academic period lifecycles, read-model snapshots for the SPA,
 * liveness probes, and non-production seed resets.
 */
export class PayrollStateService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  /** Probes database connectivity and reports process uptime without throwing on DB failure. */
  public async getHealth(): Promise<HealthResponse> {
    let dbOk = true;
    try {
      await this.repos.periods.findCurrent(this.tx.executor);
    } catch {
      dbOk = false;
    }
    return {
      status: dbOk ? 'ok' : 'degraded',
      database: dbOk ? 'up' : 'down',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Assembles the period-scoped payroll state snapshot.
   * For `dean` actors, filters units, program quotas, teachers, approvals, research, and audit logs
   * to the caller's authorized academic units.
   */
  public async getSnapshot(
    requestedPeriod?: string,
    actor?: ActorContext,
  ): Promise<PayrollSnapshot> {
    const db = this.tx.executor;
    const allPeriods = await this.repos.periods.listAll(db);
    const currentPeriod =
      allPeriods.find((p) => p.isCurrent)?.code ?? allPeriods[0]?.code ?? '2026-2';
    const activePeriod = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const deanAllowedUnits =
      actor?.role === 'dean' ? getActorAllowedUnitIds(actor) : undefined;
    const deanAllowedSet = deanAllowedUnits ? new Set(deanAllowedUnits) : undefined;

    const [
      schedulePhases,
      rulesConfig,
      sacCodes,
      allUnits,
      allProgramQuotas,
      allTeachers,
      allApprovalRequests,
      allResearchAllocations,
      auditLogs,
    ] = await Promise.all([
      this.repos.schedulePhases.listByPeriod(db, activePeriod),
      this.periodContext.getRulesForPeriod(db, activePeriod),
      this.repos.sacCodes.listAll(db),
      this.periodContext.hydrateUnitsForPeriod(db, activePeriod),
      this.repos.programs.list(db),
      this.repos.teachers.listByPeriod(db, activePeriod),
      this.repos.approvals.listByPeriod(db, activePeriod),
      this.repos.research.listByPeriod(db, activePeriod),
      this.repos.auditLogs.list(db, {
        periodCode: activePeriod,
        unitIds: deanAllowedUnits,
        limit: SNAPSHOT_AUDIT_LIMIT,
      }),
    ]);

    const units = deanAllowedSet
      ? allUnits.filter((u) => deanAllowedSet.has(u.id))
      : allUnits;
    const programQuotas = deanAllowedSet
      ? allProgramQuotas.filter((p) => deanAllowedSet.has(p.unitId))
      : allProgramQuotas;
    const teachers = deanAllowedSet
      ? allTeachers.filter((t) => deanAllowedSet.has(t.unitId))
      : allTeachers;
    const approvalRequests = deanAllowedSet
      ? allApprovalRequests.filter((r) => deanAllowedSet.has(r.unitId))
      : allApprovalRequests;
    const researchAllocations = deanAllowedSet
      ? allResearchAllocations.filter((r) => deanAllowedSet.has(r.unitId))
      : allResearchAllocations;

    return {
      activePeriod,
      currentPeriod,
      availablePeriods: allPeriods.map((p) => p.code),
      schedulePhases,
      rulesConfig,
      sacCodes,
      units,
      programQuotas,
      teachers,
      approvalRequests,
      researchAllocations,
      auditLogs,
      generatedAt: new Date().toISOString(),
    };
  }

  public async listPeriods(): Promise<AcademicPeriod[]> {
    return this.repos.periods.listAll(this.tx.executor);
  }

  /**
   * Opens a new academic period initialized from `dto.sourcePeriod` inside a single transaction,
   * marking the new period as current.
   *
   * Supported `copyMode` behaviors:
   * - `'roster_only'`: copies Dean and teacher master profiles at `0 h` (`academicSpaces: []`, `allocations: {}`),
   *   omitting research and approval rows and resetting all unit cycles to `Borrador` v1.
   * - `'empty'`: initializes rules, schedule phases, and `Borrador` v1 unit cycles with zero teacher records.
   * - `'full_clone'` (default when omitted): clones teachers, academic spaces, SAC allocations, and research rows.
   */
  public async createOrClonePeriod(
    actor: ActorContext,
    dto: CreatePeriodDto,
  ): Promise<AcademicPeriod> {
    return this.tx.run(async (trx) => {
      const code = dto.code.trim();
      const existing = await this.repos.periods.findByCode(trx, code);
      if (existing) {
        throw new ConflictError(`El periodo académico ${code} ya está registrado.`);
      }
      const source = await this.repos.periods.findByCode(trx, dto.sourcePeriod);
      if (!source) {
        throw new NotFoundError(`El periodo base ${dto.sourcePeriod} no existe.`);
      }

      const copyMode: PeriodCopyMode = dto.copyMode ?? 'full_clone';
      const shouldResetStatuses = copyMode !== 'full_clone' ? true : dto.resetStatuses;

      const nowIso = new Date().toISOString();
      const createdPeriod: AcademicPeriod = {
        code,
        name: `Periodo Académico ${code} — Seccional Tunja`,
        status: 'ABIERTO',
        isCurrent: true,
        openedAt: nowIso,
        closedAt: null,
      };

      await this.repos.periods.insertMany(trx, [createdPeriod]);
      await this.repos.periods.markCurrent(trx, code);

      const sourceRules = await this.periodContext.getRulesForPeriod(trx, dto.sourcePeriod);
      await this.repos.businessRules.save(trx, code, sourceRules, actor.name);

      const sourcePhases = await this.repos.schedulePhases.listByPeriod(trx, dto.sourcePeriod);
      if (sourcePhases.length > 0) {
        const clonedPhases = sourcePhases.map((phase) => ({
          ...phase,
          id: this.ids.next(),
          status: shouldResetStatuses ? ('Programada' as const) : phase.status,
        }));
        await this.repos.schedulePhases.insertMany(trx, code, clonedPhases);
      }

      const allUnits = await this.repos.units.listAll(trx);
      const sourceCycles = await this.repos.units.listCycles(trx, dto.sourcePeriod);
      const sourceCycleByUnit = new Map(sourceCycles.map((c) => [c.unitId, c]));

      await this.repos.units.saveCycles(
        trx,
        allUnits.map((unit) => {
          const prev = sourceCycleByUnit.get(unit.id);
          return {
            unitId: unit.id,
            periodCode: code,
            payrollStatus: shouldResetStatuses
              ? 'Borrador'
              : (prev?.payrollStatus ?? 'Borrador'),
            currentVersion: shouldResetStatuses ? 1 : (prev?.currentVersion ?? 1),
            updatedAt: nowIso,
          };
        }),
      );

      if (copyMode === 'roster_only') {
        const sourceTeachers = await this.repos.teachers.listByPeriod(trx, dto.sourcePeriod);
        const blankRosterTeachers: FacultyTeacher[] = sourceTeachers.map((teacher) => ({
          id: this.ids.next(),
          unitId: teacher.unitId,
          documentId: teacher.documentId,
          fullName: teacher.fullName,
          dedication: teacher.dedication,
          expectedWorkload: teacher.expectedWorkload,
          rank: teacher.rank,
          education: teacher.education,
          isProvisional: teacher.isProvisional,
          seniorityYears: teacher.seniorityYears,
          academicSpaces: [],
          allocations: {},
        }));
        await this.repos.teachers.insertMany(trx, code, blankRosterTeachers);
      } else if (copyMode === 'full_clone') {
        const sourceTeachers = await this.repos.teachers.listByPeriod(trx, dto.sourcePeriod);
        const teacherIdMap = new Map<string, string>();
        const clonedTeachers: FacultyTeacher[] = sourceTeachers.map((teacher) => {
          const nextId = this.ids.next();
          teacherIdMap.set(teacher.id, nextId);
          const cloned = structuredClone(teacher);
          if (shouldResetStatuses) {
            delete cloned.version1Total;
            const resetAllocations: Record<string, TeacherCodeAllocation> = {};
            for (const [sacCode, alloc] of Object.entries(cloned.allocations)) {
              const nextAlloc: TeacherCodeAllocation = {
                code: alloc.code,
                hours: alloc.hours,
                ...(alloc.unitCount !== undefined ? { unitCount: alloc.unitCount } : {}),
                ...(alloc.programId ? { programId: alloc.programId } : {}),
                ...(alloc.programName ? { programName: alloc.programName } : {}),
                ...(alloc.exceptionJustification
                  ? { exceptionJustification: alloc.exceptionJustification }
                  : {}),
              };
              resetAllocations[sacCode] = nextAlloc;
            }
            cloned.allocations = resetAllocations;
          }
          return {
            ...cloned,
            id: nextId,
            academicSpaces: teacher.academicSpaces.map((space) => ({
              ...space,
              id: this.ids.next(),
            })),
          };
        });
        await this.repos.teachers.insertMany(trx, code, clonedTeachers);

        const sourceResearch = await this.repos.research.listByPeriod(trx, dto.sourcePeriod);
        if (sourceResearch.length > 0) {
          await this.repos.research.insertMany(
            trx,
            sourceResearch.map((item) => ({
              ...item,
              id: this.ids.next(),
              period: code,
            })),
          );
        }

        if (!shouldResetStatuses) {
          const sourceApprovals = await this.repos.approvals.listByPeriod(
            trx,
            dto.sourcePeriod,
          );
          if (sourceApprovals.length > 0) {
            await this.repos.approvals.insertMany(
              trx,
              sourceApprovals.map((req) => ({
                ...req,
                id: this.ids.next(),
                period: code,
                teacherId: teacherIdMap.get(req.teacherId) ?? req.teacherId,
              })),
            );
          }
        }
      }

      const modeDescription =
        copyMode === 'empty'
          ? `Periodo abierto en blanco sin planta docente a partir de ${dto.sourcePeriod}`
          : copyMode === 'roster_only'
            ? `Periodo abierto con decanos y planta docente en 0 h a partir de ${dto.sourcePeriod}`
            : shouldResetStatuses
              ? `Configuración y carga tomadas de ${dto.sourcePeriod} con unidades abiertas en Borrador`
              : `Configuración y estados conservados a partir del periodo ${dto.sourcePeriod}`;

      await this.audit.record(trx, actor, {
        periodCode: code,
        unitId: null,
        unitName: `Consolidado seccional (${allUnits.length} unidades)`,
        action: `Apertura de periodo académico ${code}`,
        previousValue: dto.sourcePeriod,
        newValue: code,
        reason: modeDescription,
      });

      return createdPeriod;
    });
  }

  /**
   * Deletes a non-baseline academic period (`code !== '2026-2'`) and cascades removal across its
   * period-scoped cycles, teachers, spaces, allocations, approvals, and research rows.
   */
  public async deletePeriod(
    actor: ActorContext,
    rawCode: string,
  ): Promise<DeletePeriodResponse> {
    return this.tx.run(async (trx) => {
      const code = rawCode.trim();
      const normalizedComparable = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (code === PROTECTED_BASELINE_PERIOD || normalizedComparable === '20262') {
        throw new BusinessRuleError(
          'El periodo base institucional 2026-2 está protegido y no puede eliminarse.',
        );
      }

      const existing = await this.repos.periods.findByCode(trx, code);
      if (!existing) {
        throw new NotFoundError(`El periodo académico ${code} no existe.`);
      }

      const allPeriods = await this.repos.periods.listAll(trx);
      if (allPeriods.length <= 1) {
        throw new BusinessRuleError(
          'Debe permanecer al menos un periodo académico activo en la plataforma.',
        );
      }

      await this.repos.periods.delete(trx, code);

      const remaining = allPeriods.filter((p) => p.code !== code);
      let nextCurrent = remaining.find((p) => p.isCurrent)?.code;
      if (!nextCurrent) {
        nextCurrent =
          remaining.find((p) => p.code === PROTECTED_BASELINE_PERIOD)?.code ??
          remaining[0]!.code;
        await this.repos.periods.markCurrent(trx, nextCurrent);
      }

      await this.audit.record(trx, actor, {
        periodCode: nextCurrent,
        unitId: null,
        unitName: 'Configuración institucional de periodos',
        action: `Eliminación de periodo académico ${code}`,
        previousValue: code,
        newValue: `Activo: ${nextCurrent}`,
        reason: 'Retiro administrativo de periodo académico',
      });

      return {
        deletedId: code,
        activePeriod: nextCurrent,
      };
    });
  }

  /**
   * Truncates payroll tables and reloads institutional seed data.
   * Disabled in `production` and unless `ALLOW_DESTRUCTIVE_STATE_RESET === 'true'`.
   */
  public async resetToSeed(actor?: ActorContext): Promise<PayrollSnapshot> {
    if (
      ENV_CONFIG.nodeEnv === 'production' ||
      process.env.ALLOW_DESTRUCTIVE_STATE_RESET !== 'true'
    ) {
      throw new ForbiddenError(
        'El restablecimiento general de datos está deshabilitado por seguridad.',
      );
    }
    await seedDatabaseWithOfficialData(this.tx, this.repos, this.ids, {
      forceTruncate: true,
    });
    return this.getSnapshot(undefined, actor);
  }
}
