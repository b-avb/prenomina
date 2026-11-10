import type { AuditLogEntry } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { AuditLogQuery, AuditLogRecord } from '../models/audit.models.js';

/** Append-only audit trail: there is intentionally no update or delete. */
export interface AuditLogRepository {
  insertMany(db: DbExecutor, records: AuditLogRecord[]): Promise<void>;
  list(db: DbExecutor, query: AuditLogQuery): Promise<AuditLogEntry[]>;
}
