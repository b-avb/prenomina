import {
  AcademicOrganizationDomain,
  ValidationEngineDomain,
  WorkloadBalancerDomain,
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
import { assertUnitAccess } from '../auth/actor-resolver.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { AcademicUnitRecord } from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { AuthService } from './auth.service.js';
import type { PeriodContextService } from './period-context.service.js';

export class AcademicUnitsService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
    private readonly auth?: AuthService,
  ) {}

  public async list(
    requestedPeriod?: string,
    division?: string,
  ): Promise<AcademicUnitSummary[]> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const units = await this.periodContext.hydrateUnitsForPeriod(db, periodCode);
    if (!division) return units;
    return units.filter((u) => u.division.toLowerCase() === division.toLowerCase());
  }

  public async getById(
    id: string,
    requestedPeriod?: string,
  ): Promise<AcademicUnitSummary> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.periodContext.hydrateSingleUnit(db, id, periodCode);
  }

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

      const deanUser = this.auth
        ? await this.auth.syncUnitDeanUserInTransaction(trx, record, {
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.temporaryPassword !== undefined
              ? { temporaryPassword: dto.temporaryPassword }
              : {}),
          })
        : undefined;

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unit.id,
        unitName: unit.name,
        teacherName: directorTeacher.fullName,
        action: 'Creación de Unidad Académica y Directivo',
        newValue: `${unit.name} (${unit.division}) · Decano/Director: ${unit.deanName}${deanUser ? ` · Usuario: @${deanUser.username}` : ''}`,
        reason: 'Registro organizacional desde maestro de facultades',
      });

      const hydrated = await this.periodContext.hydrateSingleUnit(trx, unit.id, periodCode);
      return {
        unit: hydrated,
        directorTeacher,
        ...(deanUser ? { deanUser } : {}),
      };
    });
  }

  public async update(
    actor: ActorContext,
    dto: UpdateAcademicUnitDto,
    requestedPeriod?: string,
  ): Promise<AcademicUnitSummary> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const existing = await this.repos.units.findById(trx, dto.id, { forUpdate: true });
      if (!existing) {
        throw new NotFoundError(`La unidad académica '${dto.id}' no existe.`);
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
        action: 'Actualización de Unidad Académica y Topes',
        previousValue: existing.name,
        newValue: `${updated.name} (30411:${updated.qualityCap30411}h, 40106:${updated.curriculumCap40106}h, 40109:${updated.seaCap40109}h, 40127:${updated.saberProCap40127}h, 20502:${updated.graduatesCap20502}h)`,
        reason: 'Edición desde gestión de facultades y unidades',
      });

      return this.periodContext.hydrateSingleUnit(trx, updated.id, periodCode);
    });
  }

  public async updateDean(
    actor: ActorContext,
    dto: UpdateUnitDeanDto,
    requestedPeriod?: string,
  ): Promise<UnitWithDirectorResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, dto.unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
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

      const deanUser = this.auth
        ? await this.auth.syncUnitDeanUserInTransaction(trx, updatedRecord, {
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.temporaryPassword !== undefined
              ? { temporaryPassword: dto.temporaryPassword }
              : {}),
          })
        : undefined;

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: dto.unitId,
        unitName: updatedRecord.name,
        teacherName: directorTeacher.fullName,
        action: 'Actualización de Decano(a) / Director(a) de Unidad',
        previousValue: previousDeanName,
        newValue: `${updatedRecord.deanName}${deanUser ? ` (@${deanUser.username})` : ''}`,
        reason: 'Actualización administrativa del directivo de unidad',
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
      };
    });
  }

  public async changePayrollStatus(
    actor: ActorContext,
    dto: ChangeUnitStatusDto,
    requestedPeriod?: string,
  ): Promise<UnitVersionSnapshotResponse> {
    assertUnitAccess(actor, dto.unitId);
    if (actor.role === 'dean' && dto.status !== 'Enviada' && dto.status !== 'Borrador') {
      throw new ForbiddenError(
        `El rol 'dean' solo puede marcar la prenómina como 'Borrador' o 'Enviada' (estado solicitado: '${dto.status}').`,
      );
    }
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, dto.unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
      }

      const [cycle, rulesConfig, unitTeachers] = await Promise.all([
        this.repos.units.findCycle(trx, dto.unitId, periodCode),
        this.periodContext.getRulesForPeriod(trx, periodCode),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
      ]);

      if (dto.status === 'Enviada' && rulesConfig.blockSubmissionWithBlockingAlerts) {
        const [allUnits, allTeachers, sacCodes, approvalRequests] = await Promise.all([
          this.periodContext.hydrateUnitsForPeriod(trx, periodCode),
          this.repos.teachers.listByPeriod(trx, periodCode),
          this.repos.sacCodes.listAll(trx),
          this.repos.approvals.listByPeriod(trx, periodCode),
        ]);
        const alerts = ValidationEngineDomain.getUnitAlerts(dto.unitId, {
          units: allUnits,
          teachers: allTeachers,
          sacCodes,
          approvalRequests,
          rulesConfig,
        });
        const blockingCount = alerts.filter((a) => a.severity === 'blocking').length;
        if (blockingCount > 0) {
          throw new BusinessRuleError(
            `No se puede enviar la prenómina de ${record.name}: existen ${blockingCount} alerta(s) bloqueante(s) activa(s).`,
          );
        }
      }

      const previousStatus = cycle?.payrollStatus ?? 'Borrador';
      let nextVersion = cycle?.currentVersion ?? 1;

      if (dto.status === 'Enviada') {
        WorkloadBalancerDomain.snapshotTeachersVersion1(unitTeachers, rulesConfig);
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
        reason: dto.observation || `Transición de flujo ejecutada por ${actor.name}`,
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
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
      }

      const [cycle, rulesConfig, unitTeachers] = await Promise.all([
        this.repos.units.findCycle(trx, dto.unitId, periodCode),
        this.periodContext.getRulesForPeriod(trx, periodCode),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
      ]);

      WorkloadBalancerDomain.snapshotTeachersVersion1(unitTeachers, rulesConfig);
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
        action: 'Congelamiento de Línea Base (Versión 1 → Versión 2)',
        previousValue: `Versión ${cycle?.currentVersion ?? 1}`,
        newValue: 'Versión 2 (Jornada de Revisión)',
        reason: `Se guardó instantánea v1 para ${unitTeachers.length} docentes de la unidad`,
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

  public async remove(
    actor: ActorContext,
    unitId: string,
    requestedPeriod?: string,
  ): Promise<DeletedResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const record = await this.repos.units.findById(trx, unitId, { forUpdate: true });
      if (!record) {
        throw new NotFoundError(`La unidad académica '${unitId}' no existe.`);
      }

      await this.repos.units.delete(trx, unitId);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: record.name,
        action: 'Eliminación de Unidad Académica',
        previousValue: `${record.name} (${record.division})`,
        newValue: 'Eliminada',
        reason: 'Retiro administrativo de unidad académica',
      });

      return { deletedId: unitId };
    });
  }
}
