import type {
  AcademicPeriod,
  ActorContext,
  CreatePeriodDto,
  FacultyTeacher,
  HealthResponse,
  IdGenerator,
  PayrollSnapshot,
} from '@usta/domain';
import { isDevelopment } from '../config/env.config.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import { seedDatabaseWithOfficialData } from '../seed/database-seeder.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

const SNAPSHOT_AUDIT_LIMIT = 200;

export class PayrollStateService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

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

  public async getSnapshot(requestedPeriod?: string): Promise<PayrollSnapshot> {
    const db = this.tx.executor;
    const allPeriods = await this.repos.periods.listAll(db);
    const currentPeriod =
      allPeriods.find((p) => p.isCurrent)?.code ?? allPeriods[0]?.code ?? '2026-2';
    const activePeriod = await this.periodContext.resolvePeriod(db, requestedPeriod);

    const [
      schedulePhases,
      rulesConfig,
      sacCodes,
      units,
      programQuotas,
      teachers,
      approvalRequests,
      researchAllocations,
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
      this.repos.auditLogs.list(db, { periodCode: activePeriod, limit: SNAPSHOT_AUDIT_LIMIT }),
    ]);

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

  public async createOrClonePeriod(
    actor: ActorContext,
    dto: CreatePeriodDto,
  ): Promise<AcademicPeriod> {
    return this.tx.run(async (trx) => {
      const existing = await this.repos.periods.findByCode(trx, dto.code);
      if (existing) {
        throw new ConflictError(`El periodo académico '${dto.code}' ya existe.`);
      }
      const source = await this.repos.periods.findByCode(trx, dto.sourcePeriod);
      if (!source) {
        throw new NotFoundError(`El periodo origen '${dto.sourcePeriod}' no existe.`);
      }

      const nowIso = new Date().toISOString();
      const createdPeriod: AcademicPeriod = {
        code: dto.code,
        name: `Periodo Académico ${dto.code} — Seccional Tunja`,
        status: 'ABIERTO',
        isCurrent: true,
        openedAt: nowIso,
        closedAt: null,
      };

      await this.repos.periods.insertMany(trx, [createdPeriod]);
      await this.repos.periods.markCurrent(trx, dto.code);

      const sourceRules = await this.periodContext.getRulesForPeriod(trx, dto.sourcePeriod);
      await this.repos.businessRules.save(trx, dto.code, sourceRules, actor.name);

      const sourcePhases = await this.repos.schedulePhases.listByPeriod(trx, dto.sourcePeriod);
      if (sourcePhases.length > 0) {
        const clonedPhases = sourcePhases.map((phase) => ({
          ...phase,
          id: this.ids.next(),
          status: dto.resetStatuses ? ('Programada' as const) : phase.status,
        }));
        await this.repos.schedulePhases.insertMany(trx, dto.code, clonedPhases);
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
            periodCode: dto.code,
            payrollStatus: dto.resetStatuses ? 'Borrador' : (prev?.payrollStatus ?? 'Borrador'),
            currentVersion: dto.resetStatuses ? 1 : (prev?.currentVersion ?? 1),
            updatedAt: nowIso,
          };
        }),
      );

      const sourceTeachers = await this.repos.teachers.listByPeriod(trx, dto.sourcePeriod);
      const teacherIdMap = new Map<string, string>();
      const clonedTeachers: FacultyTeacher[] = sourceTeachers.map((teacher) => {
        const nextId = this.ids.next();
        teacherIdMap.set(teacher.id, nextId);
        return {
          ...structuredClone(teacher),
          id: nextId,
          academicSpaces: teacher.academicSpaces.map((space) => ({
            ...space,
            id: this.ids.next(),
          })),
        };
      });
      await this.repos.teachers.insertMany(trx, dto.code, clonedTeachers);

      const sourceResearch = await this.repos.research.listByPeriod(trx, dto.sourcePeriod);
      if (sourceResearch.length > 0) {
        await this.repos.research.insertMany(
          trx,
          sourceResearch.map((item) => ({
            ...item,
            id: this.ids.next(),
            period: dto.code,
          })),
        );
      }

      if (!dto.resetStatuses) {
        const sourceApprovals = await this.repos.approvals.listByPeriod(trx, dto.sourcePeriod);
        if (sourceApprovals.length > 0) {
          await this.repos.approvals.insertMany(
            trx,
            sourceApprovals.map((req) => ({
              ...req,
              id: this.ids.next(),
              period: dto.code,
              teacherId: teacherIdMap.get(req.teacherId) ?? req.teacherId,
            })),
          );
        }
      }

      await this.audit.record(trx, actor, {
        periodCode: dto.code,
        unitId: null,
        unitName: `Nivel Seccional (${allUnits.length} Unidades)`,
        action: `Apertura / Clonación de Periodo Semestral ${dto.code}`,
        previousValue: dto.sourcePeriod,
        newValue: dto.code,
        reason: dto.resetStatuses
          ? 'Catálogo SAC y topes clonados con reinicio de estados a Borrador (v1)'
          : 'Catálogo SAC y estados conservados desde el periodo anterior',
      });

      return createdPeriod;
    });
  }

  public async resetToSeed(): Promise<PayrollSnapshot> {
    if (!isDevelopment()) {
      throw new ForbiddenError(
        'El restablecimiento a la semilla institucional oficial solo está permitido en entorno de desarrollo.',
      );
    }
    await seedDatabaseWithOfficialData(this.tx, this.repos, this.ids, {
      forceTruncate: true,
    });
    return this.getSnapshot();
  }
}
