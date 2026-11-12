import type {
  ActorContext,
  CreateResearchAllocationDto,
  FacultyTeacher,
  IdGenerator,
  ResearchAllocationAnnex7,
  ResearchMutationResponse,
  UpdateResearchAllocationDto,
} from '@usta/domain';
import { assertUnitAccess, getActorAllowedUnitIds } from '../auth/actor-resolver.js';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import { BusinessRuleError, NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

/**
 * Manages Annex 7 research allocations (Dirección de Investigación) and synchronizes
 * aggregated monthly hours back onto matching full-time/half-time faculty teacher workloads.
 */
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
    actor?: ActorContext,
  ): Promise<ResearchAllocationAnnex7[]> {
    if (actor && unitId) {
      assertUnitAccess(actor, unitId);
    }
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const items = await this.repos.research.listByPeriod(
      db,
      periodCode,
      unitId ? { unitId } : undefined,
    );
    if (actor?.role === 'dean' && !unitId) {
      const allowed = new Set(getActorAllowedUnitIds(actor));
      return items.filter((item) => allowed.has(item.unitId));
    }
    return items;
  }

  /**
   * Registers an Annex 7 research allocation, rejecting `CATEDRA` teachers and invalid
   * SICDDI `10226` tiers, then recomputes the matching teacher's SAC allocation.
   */
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
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const sacCode = await this.repos.sacCodes.findByCode(trx, dto.code);
      if (!sacCode) {
        throw new NotFoundError(`El código SAC ${dto.code} no figura en el catálogo.`);
      }

      const matchedTeacher = await this.repos.teachers.findByDocument(
        trx,
        periodCode,
        dto.documentId,
        dto.unitId,
      );
      if (matchedTeacher?.dedication === 'CATEDRA') {
        throw new BusinessRuleError(
          'Los docentes de Hora Cátedra no pueden recibir horas de investigación del Anexo 7.',
        );
      }

      const allocation: ResearchAllocationAnnex7 = {
        ...dto,
        id: this.ids.next(),
        period: periodCode,
        unitName: unitRecord.name,
        activityName: sacCode.name,
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
        reason:
          allocation.notes ||
          `Asignación registrada por la Dirección de Investigación (${allocation.role})`,
      });

      return {
        allocation,
        teacher,
      };
    });
  }

  /**
   * Updates an Annex 7 research row under `FOR UPDATE` row lock and resynchronizes both the
   * prior `(unitId, documentId, code)` teacher bucket (if reassigned) and the target bucket.
   */
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
          'La asignación de investigación seleccionada no existe.',
        );
      }

      const nextCode = dto.code ?? existing.code;
      const nextUnitId = dto.unitId ?? existing.unitId;
      const nextDocumentId = dto.documentId ?? existing.documentId;
      const nextMonthlyHours = dto.monthlyHours ?? existing.monthlyHours;
      this.validateSicddiHours(nextCode, nextMonthlyHours);

      const unitRecord = await this.repos.units.findById(trx, nextUnitId);
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      const sacCode = await this.repos.sacCodes.findByCode(trx, nextCode);
      if (!sacCode) {
        throw new NotFoundError(`El código SAC ${nextCode} no figura en el catálogo.`);
      }

      const matchedTeacher = await this.repos.teachers.findByDocument(
        trx,
        existing.period,
        nextDocumentId,
        nextUnitId,
      );
      if (matchedTeacher?.dedication === 'CATEDRA') {
        throw new BusinessRuleError(
          'Los docentes de Hora Cátedra no pueden recibir horas de investigación del Anexo 7.',
        );
      }

      const updated: ResearchAllocationAnnex7 = {
        ...existing,
        ...dto,
        id: existing.id,
        period: existing.period,
        unitId: nextUnitId,
        unitName: unitRecord.name,
        documentId: nextDocumentId,
        code: nextCode,
        activityName: sacCode.name,
        monthlyHours: nextMonthlyHours,
        weeklyHours:
          dto.weeklyHours !== undefined
            ? dto.weeklyHours
            : Math.round((nextMonthlyHours / 4) * 10) / 10,
      };

      await this.repos.research.update(trx, updated);

      if (
        existing.code !== updated.code ||
        existing.documentId !== updated.documentId ||
        existing.unitId !== updated.unitId
      ) {
        await this.syncTeacherAllocationFromResearch(
          trx,
          existing.period,
          existing.documentId,
          existing.unitId,
          existing.code,
          existing.projectOrGroup,
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
        reason: updated.notes || 'Actualización en la matriz Anexo 7 de Investigación',
      });

      return {
        allocation: updated,
        teacher,
      };
    });
  }

  /** Deletes an Annex 7 research row and recalculates the affected teacher's SAC allocation. */
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
          'La asignación de investigación seleccionada no existe.',
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
        reason: 'Retiro de horas por la Dirección de Investigación',
      });

      return {
        allocation: null,
        teacher,
      };
    });
  }

  /**
   * Enforces Acuerdo 3 (19 March 2025) on SAC `10226` (SICDDI), allowing only fixed
   * monthly hour tiers of `20` (Nivel I), `80` (Nivel II), or `136` (Nivel III).
   */
  private validateSicddiHours(code: string, monthlyHours: number): void {
    if (code === '10226' && monthlyHours > 0 && ![20, 80, 136].includes(monthlyHours)) {
      throw new BusinessRuleError(
        'El código SICDDI 10226 solo admite asignaciones fijas de 20 h (Nivel I), 80 h (Nivel II) o 136 h (Nivel III), conforme al Acuerdo 3 del 19 de marzo de 2025.',
      );
    }
  }

  /**
   * Aggregates all Annex 7 monthly hours for `(periodCode, unitId, documentId, code)` and writes
   * the resulting allocation (or removes it when zero) onto the locked non-`CATEDRA` teacher record.
   */
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
    if (!teacher || teacher.dedication === 'CATEDRA') return null;

    const allResearch = await this.repos.research.listByPeriod(trx, periodCode, {
      unitId: teacher.unitId,
    });
    const matching = allResearch.filter(
      (r) => r.documentId === documentId && r.code === code,
    );
    const totalForCode = matching.reduce((acc, item) => acc + item.monthlyHours, 0);

    if (totalForCode <= 0) {
      delete teacher.allocations[code];
    } else {
      const prev = teacher.allocations[code];
      const projects = Array.from(
        new Set(matching.map((m) => m.projectOrGroup).filter(Boolean)),
      );
      teacher.allocations[code] = {
        code,
        hours: totalForCode,
        ...(prev?.version1Hours !== undefined
          ? { version1Hours: prev.version1Hours }
          : {}),
        ...(prev?.exceptionJustification
          ? { exceptionJustification: prev.exceptionJustification }
          : {}),
        directorNote: `Asignado por la Dirección de Investigación (${projects.join(' / ') || projectOrGroup})`,
      };
    }

    await this.repos.teachers.save(trx, teacher);
    return teacher;
  }
}
