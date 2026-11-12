import {
  AcademicOrganizationDomain,
  type AcademicUnitSummary,
  type ActorContext,
  type CreateAcademicProgramDto,
  type IdGenerator,
  type ProgramMutationResponse,
  type ProgramQuotaAnnex5,
  type UpdateAcademicProgramDto,
} from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type {
  AcademicProgramRecord,
  AcademicUnitRecord,
} from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import { NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

export class AcademicProgramsService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  public async list(unitId?: string): Promise<ProgramQuotaAnnex5[]> {
    return this.repos.programs.list(
      this.tx.executor,
      unitId ? { unitId } : undefined,
    );
  }

  public async create(
    actor: ActorContext,
    dto: CreateAcademicProgramDto,
    requestedPeriod?: string,
  ): Promise<ProgramMutationResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const unitRecord = await this.repos.units.findById(trx, dto.unitId, {
        forUpdate: true,
      });
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const id = this.ids.next();
      const record: AcademicProgramRecord = {
        id,
        unitId: dto.unitId,
        programName: dto.programName.trim(),
        level: dto.level,
        modality: dto.modality,
        accreditationStatus: dto.accreditationStatus.trim(),
        quality30411: dto.quality30411,
        ...(dto.qualityNotes !== undefined ? { qualityNotes: dto.qualityNotes } : {}),
        curriculum40106: dto.curriculum40106,
        ...(dto.curriculumNotes !== undefined
          ? { curriculumNotes: dto.curriculumNotes }
          : {}),
        sea40109: dto.sea40109,
        saberPro40127: dto.saberPro40127,
        isActive: dto.isActive,
      };

      await this.repos.programs.insertMany(trx, [record]);
      await this.recalculateAndPersistUnitCaps(trx, unitRecord);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        action: `Creación de programa académico: ${record.programName}`,
        newValue: `${record.level} (${record.modality}) · Calidad: ${record.quality30411} h, Currículo: ${record.curriculum40106} h, SEA: ${record.sea40109} h, Saber Pro: ${record.saberPro40127} h`,
        reason: 'Registro en Anexo 5 y actualización de cupos de la unidad',
      });

      const [program, unit] = await Promise.all([
        this.repos.programs.findById(trx, id),
        this.periodContext.hydrateSingleUnit(trx, unitRecord.id, periodCode),
      ]);

      return {
        program: program ?? null,
        unit,
      };
    });
  }

  public async update(
    actor: ActorContext,
    dto: UpdateAcademicProgramDto,
    requestedPeriod?: string,
  ): Promise<ProgramMutationResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const existing = await this.repos.programs.findById(trx, dto.id);
      if (!existing) {
        throw new NotFoundError('El programa académico seleccionado no existe.');
      }

      const unitRecord = await this.repos.units.findById(trx, existing.unitId, {
        forUpdate: true,
      });
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica asociada no existe.');
      }

      const { unitName: _unitName, ...existingRecord } = existing;
      const updatedRecord: AcademicProgramRecord = {
        ...existingRecord,
        ...(dto.programName !== undefined
          ? { programName: dto.programName.trim() }
          : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.modality !== undefined ? { modality: dto.modality } : {}),
        ...(dto.accreditationStatus !== undefined
          ? { accreditationStatus: dto.accreditationStatus.trim() }
          : {}),
        ...(dto.quality30411 !== undefined ? { quality30411: dto.quality30411 } : {}),
        ...(dto.qualityNotes !== undefined ? { qualityNotes: dto.qualityNotes } : {}),
        ...(dto.curriculum40106 !== undefined
          ? { curriculum40106: dto.curriculum40106 }
          : {}),
        ...(dto.curriculumNotes !== undefined
          ? { curriculumNotes: dto.curriculumNotes }
          : {}),
        ...(dto.sea40109 !== undefined ? { sea40109: dto.sea40109 } : {}),
        ...(dto.saberPro40127 !== undefined ? { saberPro40127: dto.saberPro40127 } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      };

      await this.repos.programs.update(trx, updatedRecord);
      if (updatedRecord.programName !== existing.programName) {
        await trx
          .updateTable('teacher_code_allocations')
          .set({ program_name: updatedRecord.programName })
          .where('program_id', '=', dto.id)
          .execute();
      }
      await this.recalculateAndPersistUnitCaps(trx, unitRecord);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        action: `Actualización de programa académico: ${updatedRecord.programName}`,
        previousValue: `${existing.programName} (Calidad: ${existing.quality30411} h, Currículo: ${existing.curriculum40106} h, SEA: ${existing.sea40109} h, Saber Pro: ${existing.saberPro40127} h)`,
        newValue: `${updatedRecord.programName} (Calidad: ${updatedRecord.quality30411} h, Currículo: ${updatedRecord.curriculum40106} h, SEA: ${updatedRecord.sea40109} h, Saber Pro: ${updatedRecord.saberPro40127} h)`,
        reason: 'Edición en Anexo 5 y actualización de cupos de la unidad',
      });

      const [program, unit] = await Promise.all([
        this.repos.programs.findById(trx, dto.id),
        this.periodContext.hydrateSingleUnit(trx, unitRecord.id, periodCode),
      ]);

      return {
        program: program ?? null,
        unit,
      };
    });
  }

  public async remove(
    actor: ActorContext,
    id: string,
    requestedPeriod?: string,
  ): Promise<ProgramMutationResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const existing = await this.repos.programs.findById(trx, id);
      if (!existing) {
        throw new NotFoundError('El programa académico seleccionado no existe.');
      }

      const unitRecord = await this.repos.units.findById(trx, existing.unitId, {
        forUpdate: true,
      });
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica asociada no existe.');
      }

      await trx
        .updateTable('teacher_code_allocations')
        .set({ program_id: null, program_name: null })
        .where('program_id', '=', id)
        .execute();
      await this.repos.programs.delete(trx, id);
      await this.recalculateAndPersistUnitCaps(trx, unitRecord, {
        forceZeroWhenNoPrograms: true,
      });

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        action: `Eliminación de Programa Académico: ${existing.programName}`,
        previousValue: existing.programName,
        newValue: 'Retirado',
        reason: 'Retiro de programa en Anexo 5 y actualización de cupos de la unidad',
      });

      const unit = await this.periodContext.hydrateSingleUnit(
        trx,
        unitRecord.id,
        periodCode,
      );
      return {
        program: null,
        unit,
      };
    });
  }

  private async recalculateAndPersistUnitCaps(
    trx: DbExecutor,
    unitRecord: AcademicUnitRecord,
    options?: { forceZeroWhenNoPrograms?: boolean },
  ): Promise<void> {
    const unitPrograms = await this.repos.programs.list(trx, {
      unitId: unitRecord.id,
    });
    const draftSummary: AcademicUnitSummary = {
      ...unitRecord,
      payrollStatus: 'Borrador',
      currentVersion: 1,
      totalTeachers: 0,
      pendingAlerts: 0,
      pendingApprovals: 0,
    };
    const changed = AcademicOrganizationDomain.recalculateUnitCapsFromPrograms(
      draftSummary,
      unitPrograms,
      options,
    );
    if (changed) {
      await this.repos.units.update(trx, {
        ...unitRecord,
        hasPostgraduates: draftSummary.hasPostgraduates,
        qualityCap30411: draftSummary.qualityCap30411,
        curriculumCap40106: draftSummary.curriculumCap40106,
        seaCap40109: draftSummary.seaCap40109,
        saberProCap40127: draftSummary.saberProCap40127,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}
