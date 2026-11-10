import type {
  ActorContext,
  CreateResearchAllocationDto,
  FacultyTeacher,
  IdGenerator,
  ResearchAllocationAnnex7,
  ResearchMutationResponse,
  UpdateResearchAllocationDto,
} from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import { BusinessRuleError, NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

export class ResearchService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  public async list(
    requestedPeriod?: string,
    unitId?: string,
  ): Promise<ResearchAllocationAnnex7[]> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.repos.research.listByPeriod(
      db,
      periodCode,
      unitId ? { unitId } : undefined,
    );
  }

  public async create(
    actor: ActorContext,
    dto: CreateResearchAllocationDto,
    requestedPeriod?: string,
  ): Promise<ResearchMutationResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      this.validateSicddiHours(dto.code, dto.monthlyHours);

      const unitRecord = await this.repos.units.findById(trx, dto.unitId);
      if (!unitRecord) {
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
      }

      const sacCode = await this.repos.sacCodes.findByCode(trx, dto.code);
      if (!sacCode) {
        throw new NotFoundError(`El código SAC '${dto.code}' no existe.`);
      }

      const allocation: ResearchAllocationAnnex7 = {
        ...dto,
        id: this.ids.next(),
        period: periodCode,
        unitName: unitRecord.name,
        weeklyHours:
          dto.weeklyHours > 0
            ? dto.weeklyHours
            : Math.round((dto.monthlyHours / 4) * 10) / 10,
      };

      await this.repos.research.insertMany(trx, [allocation]);

      const teacher = await this.syncTeacherAllocationFromResearch(
        trx,
        periodCode,
        allocation.documentId,
        allocation.unitId,
        allocation.code,
        allocation.projectOrGroup,
      );

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: allocation.unitId,
        unitName: allocation.unitName,
        teacherName: allocation.teacherName,
        action: `Asignación de Investigación ANEXO 7 (Cód. ${allocation.code})`,
        newValue: `${allocation.monthlyHours} h/mes (${allocation.weeklyHours} h/sem) · ${allocation.projectOrGroup}`,
        reason: allocation.notes || `Cargue oficial desde Unidad de Investigación (${allocation.role})`,
      });

      return {
        allocation,
        teacher,
      };
    });
  }

  public async update(
    actor: ActorContext,
    dto: UpdateResearchAllocationDto,
  ): Promise<ResearchMutationResponse> {
    return this.tx.run(async (trx) => {
      const existing = await this.repos.research.findById(trx, dto.id, {
        forUpdate: true,
      });
      if (!existing) {
        throw new NotFoundError(
          `El registro de investigación '${dto.id}' no existe en el ANEXO 7.`,
        );
      }

      const nextCode = dto.code ?? existing.code;
      const nextMonthlyHours = dto.monthlyHours ?? existing.monthlyHours;
      this.validateSicddiHours(nextCode, nextMonthlyHours);

      const updated: ResearchAllocationAnnex7 = {
        ...existing,
        ...dto,
        id: existing.id,
        period: existing.period,
        code: nextCode,
        monthlyHours: nextMonthlyHours,
        weeklyHours:
          dto.weeklyHours !== undefined
            ? dto.weeklyHours
            : Math.round((nextMonthlyHours / 4) * 10) / 10,
      };

      await this.repos.research.update(trx, updated);

      if (existing.code !== updated.code) {
        await this.syncTeacherAllocationFromResearch(
          trx,
          existing.period,
          existing.documentId,
          existing.unitId,
          existing.code,
          updated.projectOrGroup,
        );
      }

      const teacher = await this.syncTeacherAllocationFromResearch(
        trx,
        updated.period,
        updated.documentId,
        updated.unitId,
        updated.code,
        updated.projectOrGroup,
      );

      await this.audit.record(trx, actor, {
        periodCode: updated.period,
        unitId: updated.unitId,
        unitName: updated.unitName,
        teacherName: updated.teacherName,
        action: `Actualización de Investigación ANEXO 7 (Cód. ${updated.code})`,
        previousValue: `${existing.monthlyHours} h/mes (${existing.projectOrGroup})`,
        newValue: `${updated.monthlyHours} h/mes (${updated.projectOrGroup})`,
        reason: updated.notes || 'Edición en matriz oficial ANEXO 7 de Investigación',
      });

      return {
        allocation: updated,
        teacher,
      };
    });
  }

  public async remove(
    actor: ActorContext,
    id: string,
  ): Promise<ResearchMutationResponse> {
    return this.tx.run(async (trx) => {
      const existing = await this.repos.research.findById(trx, id, {
        forUpdate: true,
      });
      if (!existing) {
        throw new NotFoundError(
          `El registro de investigación '${id}' no existe en el ANEXO 7.`,
        );
      }

      await this.repos.research.delete(trx, id);

      const teacher = await this.syncTeacherAllocationFromResearch(
        trx,
        existing.period,
        existing.documentId,
        existing.unitId,
        existing.code,
        existing.projectOrGroup,
      );

      await this.audit.record(trx, actor, {
        periodCode: existing.period,
        unitId: existing.unitId,
        unitName: existing.unitName,
        teacherName: existing.teacherName,
        action: `Retiro de Investigación ANEXO 7 (Cód. ${existing.code})`,
        previousValue: `${existing.monthlyHours} h/mes (${existing.projectOrGroup})`,
        newValue: '0 h/mes',
        reason: 'Eliminación de asignación desde Unidad de Investigación',
      });

      return {
        allocation: null,
        teacher,
      };
    });
  }

  private validateSicddiHours(code: string, monthlyHours: number): void {
    if (code === '10226' && monthlyHours > 0 && ![20, 80, 136].includes(monthlyHours)) {
      throw new BusinessRuleError(
        'El código SICDDI 10226 solo permite asignaciones mensuales fijas de 20 h (Nivel I), 80 h (Nivel II) o 136 h (Nivel III) según el Acuerdo 3 del 19/03/2025.',
      );
    }
  }

  private async syncTeacherAllocationFromResearch(
    trx: DbExecutor,
    periodCode: string,
    documentId: string,
    unitId: string,
    code: string,
    projectOrGroup: string,
  ): Promise<FacultyTeacher | null> {
    const teacher = await this.repos.teachers.findByDocument(
      trx,
      periodCode,
      documentId,
      unitId,
      { forUpdate: true },
    );
    if (!teacher) return null;

    const allResearch = await this.repos.research.listByPeriod(trx, periodCode, {
      unitId: teacher.unitId,
    });
    const totalForCode = allResearch
      .filter((r) => r.documentId === documentId && r.code === code)
      .reduce((acc, item) => acc + item.monthlyHours, 0);

    if (totalForCode <= 0) {
      delete teacher.allocations[code];
    } else {
      const prev = teacher.allocations[code];
      teacher.allocations[code] = {
        code,
        hours: totalForCode,
        ...(prev?.version1Hours !== undefined
          ? { version1Hours: prev.version1Hours }
          : { version1Hours: totalForCode }),
        directorNote: `Sincronizado desde Dirección de Investigación (${projectOrGroup})`,
      };
    }

    await this.repos.teachers.save(trx, teacher);
    return teacher;
  }
}
