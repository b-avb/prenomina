import type { AuditLogEntry } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { AuditLogQuery, AuditLogRecord } from '../../models/audit.models.js';
import type { AuditLogRepository } from '../audit-log.repository.js';
import { toAuditLogEntry, toAuditLogRow } from './mappers/audit-log.mapper.js';

/**
 * MariaDB adapter for append-only `audit_logs`, ordering reads by `(occurred_at DESC, insertion_order DESC)`
 * for deterministic ordering across sub-second batch writes.
 */
export class MariaDbAuditLogRepository implements AuditLogRepository {
  public async insertMany(db: DbExecutor, records: AuditLogRecord[]): Promise<void> {
    if (records.length === 0) return;
    await db.insertInto('audit_logs').values(records.map(toAuditLogRow)).execute();
  }

  public async list(db: DbExecutor, query: AuditLogQuery): Promise<AuditLogEntry[]> {
    let select = db.selectFrom('audit_logs').selectAll();
    if (query.periodCode) select = select.where('period_code', '=', query.periodCode);
    if (query.unitId) select = select.where('unit_id', '=', query.unitId);
    if (query.unitIds) {
      if (query.unitIds.length === 0) return [];
      select = select.where('unit_id', 'in', [...query.unitIds]);
    }
    const rows = await select
      .orderBy('occurred_at', 'desc')
      .orderBy('insertion_order', 'desc')
      .limit(query.limit)
      .execute();
    return rows.map(toAuditLogEntry);
  }
}
