import type {
  ActorContext,
  ApprovalRequestAnnex3,
  ApprovalStatus,
  CreateApprovalRequestDto,
  DecideApprovalDto,
  IdGenerator,
} from '@usta/domain';
import type { TransactionRunner } from '../database/transaction-runner.js';
import { assertUnitAccess } from '../auth/actor-resolver.js';
import type { Repositories } from '../repositories/repositories.js';
import { NotFoundError } from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

export class ApprovalsService {
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
    status?: ApprovalStatus,
  ): Promise<ApprovalRequestAnnex3[]> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.repos.approvals.listByPeriod(db, periodCode, { unitId, status });
  }

  public async create(
    actor: ActorContext,
    dto: CreateApprovalRequestDto,
    requestedPeriod?: string,
  ): Promise<ApprovalRequestAnnex3> {
    assertUnitAccess(actor, dto.unitId);
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const today = new Date().toISOString().slice(0, 10);

      const existing = await this.repos.approvals.findByTeacherAndCode(
        trx,
        dto.teacherId,
        dto.code,
        { forUpdate: true },
      );

      let persisted: ApprovalRequestAnnex3;
      if (existing) {
        persisted = {
          ...dto,
          id: existing.id,
          period: existing.period,
          status: 'Pendiente',
          requestedAt: today,
        };
        await this.repos.approvals.update(trx, persisted);
      } else {
        persisted = {
          ...dto,
          id: this.ids.next(),
          period: periodCode,
          status: 'Pendiente',
          requestedAt: today,
        };
        await this.repos.approvals.insertMany(trx, [persisted]);
      }

      await this.audit.record(trx, actor, {
        periodCode: persisted.period,
        unitId: persisted.unitId,
        unitName: persisted.unitName,
        teacherName: persisted.teacherName,
        action: existing
          ? `Actualización de Solicitud ANEXO 3 (Cód. ${persisted.code})`
          : `Radicación de Solicitud de Pre-Aval ANEXO 3 (Cód. ${persisted.code})`,
        previousValue: existing ? `${existing.requestedHours} h (${existing.status})` : 'Sin radicar',
        newValue: `${persisted.requestedHours} h (${persisted.projectDetails.length} ítem(s) · Pendiente)`,
        reason: `Formato digital ${persisted.formatType} — Programa: ${persisted.programName}`,
      });

      return (await this.repos.approvals.findById(trx, persisted.id)) ?? persisted;
    });
  }

  public async decide(
    actor: ActorContext,
    dto: DecideApprovalDto,
  ): Promise<ApprovalRequestAnnex3> {
    return this.tx.run(async (trx) => {
      const existing = await this.repos.approvals.findById(trx, dto.id, {
        forUpdate: true,
      });
      if (!existing) {
        throw new NotFoundError(`La solicitud de pre-aval '${dto.id}' no existe.`);
      }

      const today = new Date().toISOString().slice(0, 10);
      const updated: ApprovalRequestAnnex3 = {
        ...existing,
        status: dto.status,
        ...(dto.viceRectorNote !== undefined
          ? { viceRectorNote: dto.viceRectorNote }
          : {}),
        decidedBy: actor.name,
        decidedAt: today,
      };

      await this.repos.approvals.update(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode: updated.period,
        unitId: updated.unitId,
        unitName: updated.unitName,
        teacherName: updated.teacherName,
        action: `Decisión Pre-Aval V.A. Cód. ${updated.code}: ${updated.status}`,
        previousValue: existing.status,
        newValue: `${updated.status} (${updated.requestedHours} h)`,
        reason:
          dto.viceRectorNote ||
          `Revisión de ANEXO 3 decidida por ${actor.name}`,
      });

      return updated;
    });
  }
}
