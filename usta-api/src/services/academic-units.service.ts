import {
  AcademicOrganizationDomain,
  ValidationEngineDomain,
  WorkloadBalancerDomain,
  WorkloadCalculatorDomain,
  type AcademicUnitSummary,
  type ActorContext,
  type ChangeUnitStatusDto,
  type CreateAcademicUnitDto,
  type DeletedResponse,
  type IdGenerator,
  type SnapshotUnitVersionDto,
  type UnitVersionSnapshotResponse,
  type UnitWithDirectorResponse,
  type UpdateAcademicUnitDto,
  type UpdateUnitDeanDto,
} from '@usta/domain';
import { assertUnitAccess, getActorAllowedUnitIds } from '../auth/actor-resolver.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { AcademicUnitRecord } from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { AuthService } from './auth.service.js';
import type { PeriodContextService } from './period-context.service.js';

/**
 * Orchestrates academic unit governance, Dean assignment and `DIRECTIVO` roster synchronization,
 * period payroll workflow state transitions, and Version 1 workload baseline snapshots.
 */
export class AcademicUnitsService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
    private readonly auth?: AuthService,
  ) {}

  /** Lists hydrated academic units for a period, restricting Dean callers to their `managedUnitIds`. */
  public async list(
    requestedPeriod?: string,
    division?: string,
    actor?: ActorContext,
  ): Promise<AcademicUnitSummary[]> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    let units = await this.periodContext.hydrateUnitsForPeriod(db, periodCode);
    if (actor?.role === 'dean') {
      const allowed = new Set(getActorAllowedUnitIds(actor));
      units = units.filter((u) => allowed.has(u.id));
    }
    if (!division) return units;
    return units.filter((u) => u.division.toLowerCase() === division.toLowerCase());
  }

  public async getById(
    id: string,
    requestedPeriod?: string,
    actor?: ActorContext,
  ): Promise<AcademicUnitSummary> {
    if (actor) {
      assertUnitAccess(actor, id);
    }
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.periodContext.hydrateSingleUnit(db, id, periodCode);
  }

  /**
   * Creates an academic unit, initializes `Borrador` payroll cycles across all registered periods,
   * inserts the unit's `DIRECTIVO` teacher record in the target period, and provisions or links
   * the corresponding Dean user account within a single transaction.
   */
  public async create(
    actor: ActorContext,
    dto: CreateAcademicUnitDto,
    requestedPeriod?: string,
  ): Promise<UnitWithDirectorResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const count = await this.repos.units.count(trx);
      const { unit, directorTeacher } = AcademicOrganizationDomain.buildNewUnitAndDirector(
        dto,
        count,
        this.ids,
      );
      const nowIso = new Date().toISOString();

      const record: AcademicUnitRecord = {
        id: unit.id,
        name: unit.name,
        division: unit.division,
        unitType: unit.unitType,
        hasPostgraduates: unit.hasPostgraduates,
        deanName: unit.deanName,
        qualityCap30411: unit.qualityCap30411,
        curriculumCap40106: unit.curriculumCap40106,
        seaCap40109: unit.seaCap40109,
        saberProCap40127: unit.saberProCap40127,
        graduatesCap20502: unit.graduatesCap20502,
        updatedAt: nowIso,
      };

      await this.repos.units.insertMany(trx, [record]);

      const periods = await this.repos.periods.listAll(trx);
      const periodCodes = periods.length > 0 ? periods.map((p) => p.code) : [periodCode];
      await this.repos.units.saveCycles(
        trx,
        periodCodes.map((code) => ({
          unitId: unit.id,
          periodCode: code,
          payrollStatus: 'Borrador',
          currentVersion: 1,
          updatedAt: nowIso,
        })),
      );

      await this.repos.teachers.insertMany(trx, periodCode, [directorTeacher]);

      const syncedDean = this.auth
        ? await this.auth.syncUnitDeanUserInTransaction(trx, record, {
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.temporaryPassword !== undefined
              ? { temporaryPassword: dto.temporaryPassword }
              : {}),
          })
        : undefined;
      const deanUser = syncedDean?.user;
      const temporaryPassword = syncedDean?.temporaryPassword;

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unit.id,
        unitName: unit.name,
        teacherName: directorTeacher.fullName,
        action: 'Creación de unidad académica y directivo',
        newValue: `${unit.name} (${unit.division}) · Directivo: ${unit.deanName}${deanUser ? ` · Usuario: ${deanUser.username}` : ''}`,
        reason: 'Registro desde el directorio de facultades y unidades',
      });

      const hydrated = await this.periodContext.hydrateSingleUnit(trx, unit.id, periodCode);
      return {
        unit: hydrated,
        directorTeacher,
        ...(deanUser ? { deanUser } : {}),
        ...(temporaryPassword ? { temporaryPassword } : {}),
      };
    });
  }

  /** Updates global unit metadata and Annex 5/6 SAC hour caps under a `FOR UPDATE` row lock. */
  public async update(
    actor: ActorContext,
    dto: UpdateAcademicUnitDto,
    requestedPeriod?: string,
  ): Promise<AcademicUnitSummary> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const existing = await this.repos.units.findById(trx, dto.id, { forUpdate: true });
      if (!existing) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const nowIso = new Date().toISOString();
      const updated: AcademicUnitRecord = {
        ...existing,
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.division !== undefined ? { division: dto.division.trim() } : {}),
        ...(dto.unitType !== undefined ? { unitType: dto.unitType } : {}),
        ...(dto.hasPostgraduates !== undefined
          ? { hasPostgraduates: dto.hasPostgraduates }
          : {}),
        ...(dto.qualityCap30411 !== undefined
          ? { qualityCap30411: dto.qualityCap30411 }
          : {}),
        ...(dto.curriculumCap40106 !== undefined
          ? { curriculumCap40106: dto.curriculumCap40106 }
          : {}),
        ...(dto.seaCap40109 !== undefined ? { seaCap40109: dto.seaCap40109 } : {}),
        ...(dto.saberProCap40127 !== undefined
          ? { saberProCap40127: dto.saberProCap40127 }
          : {}),
        ...(dto.graduatesCap20502 !== undefined
          ? { graduatesCap20502: dto.graduatesCap20502 }
          : {}),
        updatedAt: nowIso,
      };

      await this.repos.units.update(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: updated.id,
        unitName: updated.name,
        action: 'Actualización de unidad académica y cupos',
        previousValue: existing.name,
        newValue: `${updated.name} (Calidad: ${updated.qualityCap30411} h, Currículo: ${updated.curriculumCap40106} h, SEA: ${updated.seaCap40109} h, Saber Pro: ${updated.saberProCap40127} h, Graduados: ${updated.graduatesCap20502} h)`,
        reason: 'Edición en la configuración de unidades académicas',
      });

      return this.periodContext.hydrateSingleUnit(trx, updated.id, periodCode);
    });
  }

  /**
   * Updates the titular Dean of a unit, upserts the unit's `DIRECTIVO` teacher entry in the
   * active period, and synchronizes or rotates the Dean's login credentials.
   */
  public async updateDean(
    actor: ActorContext,
    dto: UpdateUnitDeanDto,
    requestedPeriod?: string,
  ): Promise<UnitWithDirectorResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, dto.unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const [unitSummary, unitTeachers, totalUnits] = await Promise.all([
        this.periodContext.hydrateSingleUnit(trx, dto.unitId, periodCode),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
        this.repos.units.count(trx),
      ]);

      const { previousDeanName, directorTeacher, created } =
        AcademicOrganizationDomain.updateDeanAndDirectorTeacher(
          unitSummary,
          unitTeachers,
          dto,
          totalUnits,
          this.ids,
        );

      const nowIso = new Date().toISOString();
      const updatedRecord: AcademicUnitRecord = {
        ...record,
        deanName: unitSummary.deanName,
        updatedAt: nowIso,
      };

      await this.repos.units.update(trx, updatedRecord);
      if (created) {
        await this.repos.teachers.insertMany(trx, periodCode, [directorTeacher]);
      } else {
        await this.repos.teachers.save(trx, directorTeacher);
      }

      const syncedDean = this.auth
        ? await this.auth.syncUnitDeanUserInTransaction(trx, updatedRecord, {
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.temporaryPassword !== undefined
              ? { temporaryPassword: dto.temporaryPassword }
              : {}),
          })
        : undefined;
      const deanUser = syncedDean?.user;
      const temporaryPassword = syncedDean?.temporaryPassword;

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: dto.unitId,
        unitName: updatedRecord.name,
        teacherName: directorTeacher.fullName,
        action: 'Actualización de Decano o Director de Unidad',
        previousValue: previousDeanName,
        newValue: `${updatedRecord.deanName}${deanUser ? ` (${deanUser.username})` : ''}`,
        reason: 'Actualización del directivo titular de la unidad',
      });

      const hydrated = await this.periodContext.hydrateSingleUnit(
        trx,
        dto.unitId,
        periodCode,
      );
      return {
        unit: hydrated,
        directorTeacher,
        ...(deanUser ? { deanUser } : {}),
        ...(temporaryPassword ? { temporaryPassword } : {}),
      };
    });
  }

  /**
   * Transitions a unit's period payroll workflow status.
   *
   * Workflow invariants:
   * - Deans may only submit (`Borrador` | `Devuelta con Observaciones` -> `Enviada`) or withdraw
   *   a submission (`Enviada` -> `Borrador`) before review begins; `En Revisión`, `Devuelta con Observaciones`,
   *   and `Avalada` require institutional governance roles.
   * - Submission to `Enviada` rejects unstarted rosters and (when `blockSubmissionWithBlockingAlerts` is true)
   *   any unresolved `blocking` alert under `enforceSubmissionReadiness`.
   * - Submitting from Version 1 snapshots `version1Total` and `version1Hours` across unit teachers and
   *   advances `currentVersion` to `2`.
   */
  public async changePayrollStatus(
    actor: ActorContext,
    dto: ChangeUnitStatusDto,
    requestedPeriod?: string,
  ): Promise<UnitVersionSnapshotResponse> {
    assertUnitAccess(actor, dto.unitId);
    if (actor.role === 'dean' && dto.status !== 'Enviada' && dto.status !== 'Borrador') {
      throw new ForbiddenError(
        'La decanatura solo puede enviar la prenómina a revisión o retirar el envío mientras no haya iniciado la revisión.',
      );
    }
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, dto.unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const [cycle, rulesConfig, unitTeachers] = await Promise.all([
        this.repos.units.findCycle(trx, dto.unitId, periodCode),
        this.periodContext.getRulesForPeriod(trx, periodCode),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
      ]);

      const previousStatus = cycle?.payrollStatus ?? 'Borrador';
      const previousVersion = cycle?.currentVersion ?? 1;

      if (actor.role === 'dean') {
        if (
          dto.status === 'Enviada' &&
          previousStatus !== 'Borrador' &&
          previousStatus !== 'Devuelta con Observaciones'
        ) {
          throw new BusinessRuleError(
            `La prenómina de ${record.name} ya se encuentra en estado ${previousStatus} y no admite un nuevo envío.`,
          );
        }
        if (dto.status === 'Borrador' && previousStatus !== 'Enviada') {
          throw new BusinessRuleError(
            `No es posible reabrir la prenómina de ${record.name} porque ya se encuentra en estado ${previousStatus}.`,
          );
        }
      }

      if (dto.status === 'Enviada') {
        if (
          unitTeachers.length > 0 &&
          unitTeachers.every((t) => WorkloadCalculatorDomain.isTeacherUnstarted(t))
        ) {
          throw new BusinessRuleError(
            `No se puede enviar la prenómina de ${record.name} porque aún no se han registrado horas académicas.`,
          );
        }
        if (rulesConfig.blockSubmissionWithBlockingAlerts) {
          const [allUnits, allTeachers, sacCodes, approvalRequests, programQuotas] =
            await Promise.all([
              this.periodContext.hydrateUnitsForPeriod(trx, periodCode),
              this.repos.teachers.listByPeriod(trx, periodCode),
              this.repos.sacCodes.listAll(trx),
              this.repos.approvals.listByPeriod(trx, periodCode),
              this.repos.programs.list(trx),
            ]);
          const alerts = ValidationEngineDomain.getUnitAlerts(
            dto.unitId,
            {
              units: allUnits,
              teachers: allTeachers,
              sacCodes,
              approvalRequests,
              programQuotas,
              rulesConfig,
            },
            { enforceSubmissionReadiness: true },
          );
          const blockingCount = alerts.filter((a) => a.severity === 'blocking').length;
          if (blockingCount > 0) {
            throw new BusinessRuleError(
              blockingCount === 1
                ? `No se puede enviar la prenómina de ${record.name}: queda 1 alerta bloqueante pendiente por resolver.`
                : `No se puede enviar la prenómina de ${record.name}: quedan ${blockingCount} alertas bloqueantes pendientes por resolver.`,
            );
          }
        }
      }

      let nextVersion = previousVersion;

      if (dto.status === 'Enviada') {
        WorkloadBalancerDomain.snapshotTeachersVersion1(unitTeachers, rulesConfig, {
          forceOverwrite: previousVersion === 1,
        });
        for (const teacher of unitTeachers) {
          await this.repos.teachers.save(trx, teacher);
        }
        if (nextVersion === 1) {
          nextVersion = 2;
        }
      } else if (dto.status === 'Devuelta con Observaciones' && nextVersion < 2) {
        nextVersion = 2;
      }

      const nowIso = new Date().toISOString();
      await this.repos.units.saveCycles(trx, [
        {
          unitId: dto.unitId,
          periodCode,
          payrollStatus: dto.status,
          currentVersion: nextVersion,
          updatedAt: nowIso,
        },
      ]);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: dto.unitId,
        unitName: record.name,
        action: `Cambio de estado de prenómina (${previousStatus} → ${dto.status})`,
        previousValue: previousStatus,
        newValue: dto.status,
        reason: dto.observation || `Actualización de estado registrada por ${actor.name}`,
      });

      const hydrated = await this.periodContext.hydrateSingleUnit(
        trx,
        dto.unitId,
        periodCode,
      );
      return {
        unit: hydrated,
        teachers: unitTeachers,
      };
    });
  }

  /** Explicitly captures a new Version 1 reference snapshot across all teachers in the unit and sets `currentVersion = 2`. */
  public async snapshotUnitVersion(
    actor: ActorContext,
    dto: SnapshotUnitVersionDto,
    requestedPeriod?: string,
  ): Promise<UnitVersionSnapshotResponse> {
    assertUnitAccess(actor, dto.unitId);
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, dto.unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const [cycle, rulesConfig, unitTeachers] = await Promise.all([
        this.repos.units.findCycle(trx, dto.unitId, periodCode),
        this.periodContext.getRulesForPeriod(trx, periodCode),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
      ]);

      WorkloadBalancerDomain.snapshotTeachersVersion1(unitTeachers, rulesConfig, {
        forceOverwrite: true,
      });
      for (const teacher of unitTeachers) {
        await this.repos.teachers.save(trx, teacher);
      }

      const nowIso = new Date().toISOString();
      await this.repos.units.saveCycles(trx, [
        {
          unitId: dto.unitId,
          periodCode,
          payrollStatus: cycle?.payrollStatus ?? 'En Revisión',
          currentVersion: 2,
          updatedAt: nowIso,
        },
      ]);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: dto.unitId,
        unitName: record.name,
        action: 'Registro de versión inicial de revisión',
        previousValue: `Versión ${cycle?.currentVersion ?? 1}`,
        newValue: 'Versión 2 (Jornada de revisión)',
        reason: `Se guardó la versión inicial de referencia para ${unitTeachers.length} docentes`,
      });

      const hydrated = await this.periodContext.hydrateSingleUnit(
        trx,
        dto.unitId,
        periodCode,
      );
      return {
        unit: hydrated,
        teachers: unitTeachers,
      };
    });
  }

  /** Deletes an academic unit and deactivates (or re-homes) any Dean user account bound exclusively to it. */
  public async remove(
    actor: ActorContext,
    unitId: string,
    requestedPeriod?: string,
  ): Promise<DeletedResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      await this.auth?.deactivateExclusiveDeanForDeletedUnit(trx, unitId);
      await this.repos.units.delete(trx, unitId);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: record.name,
        action: 'Retiro de unidad académica',
        previousValue: `${record.name} (${record.division})`,
        newValue: 'Retirada',
        reason: 'Retiro administrativo en el directorio institucional',
      });

      return { deletedId: unitId };
    });
  }
}
