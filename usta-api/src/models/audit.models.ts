/** What a service describes when recording an audit entry. */
export interface AuditEntryDraft {
  periodCode: string;
  unitId?: string | null;
  unitName: string;
  teacherName?: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

/** Fully materialized audit entry, ready to be persisted. */
export interface AuditLogRecord extends AuditEntryDraft {
  id: string;
  occurredAt: Date;
  actorName: string;
  actorRole: string;
}

export interface AuditLogQuery {
  periodCode?: string;
  unitId?: string;
  unitIds?: readonly string[];
  limit: number;
}
