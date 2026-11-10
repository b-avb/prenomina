import type { Insertable, Selectable } from 'kysely';
import type { AuditLogEntry } from '@usta/domain';
import type { AuditLogsTable } from '../../../database/database.types.js';
import type { AuditLogRecord } from '../../../models/audit.models.js';
import { definedProps, nullable, toIsoString } from './mapper.utils.js';

export function toAuditLogEntry(row: Selectable<AuditLogsTable>): AuditLogEntry {
  return {
    id: row.id,
    timestamp: toIsoString(row.occurred_at),
    user: row.actor_name,
    role: row.actor_role,
    unitName: row.unit_name,
    action: row.action,
    ...definedProps({
      teacherName: row.teacher_name,
      previousValue: row.previous_value,
      newValue: row.new_value,
      reason: row.reason,
    }),
  };
}

export function toAuditLogRow(record: AuditLogRecord): Omit<Insertable<AuditLogsTable>, 'insertion_order'> {
  return {
    id: record.id,
    period_code: record.periodCode,
    occurred_at: record.occurredAt,
    actor_name: record.actorName,
    actor_role: record.actorRole,
    unit_id: record.unitId ?? null,
    unit_name: record.unitName,
    teacher_name: nullable(record.teacherName),
    action: record.action,
    previous_value: nullable(record.previousValue),
    new_value: nullable(record.newValue),
    reason: nullable(record.reason),
  };
}
