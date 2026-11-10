import type { ActorContext, AuditLogEntry, IdGenerator } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { AuditEntryDraft, AuditLogRecord } from '../models/audit.models.js';
import type { Repositories } from '../repositories/repositories.js';

const DEFAULT_AUDIT_LIMIT = 200;
const MAX_AUDIT_LIMIT = 1000;

export class AuditService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Pick<Repositories, 'auditLogs' | 'periods'>,
    private readonly ids: IdGenerator,
  ) {}

  /**
   * Appends an immutable audit entry inside the caller's transaction (`db`).
   */
  public async record(
    db: DbExecutor,
    actor: ActorContext,
    draft: AuditEntryDraft,
  ): Promise<void> {
    const entry: AuditLogRecord = {
      ...draft,
      id: this.ids.next(),
      occurredAt: new Date(),
      actorName: actor.name,
      actorRole: actor.role,
    };
    await this.repos.auditLogs.insertMany(db, [entry]);
  }

  public async list(options: {
    period?: string;
    unitId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const db = this.tx.executor;
    let periodCode = options.period;
    if (!periodCode) {
      const current = await this.repos.periods.findCurrent(db);
      periodCode = current?.code;
    }
    const rawLimit = options.limit ?? DEFAULT_AUDIT_LIMIT;
    const limit = Math.max(1, Math.min(MAX_AUDIT_LIMIT, rawLimit));
    return this.repos.auditLogs.list(db, {
      periodCode,
      unitId: options.unitId,
      limit,
    });
  }
}
