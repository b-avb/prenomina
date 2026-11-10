import type { AuditLogListResponse } from '@usta/domain';
import type { HttpClient } from '../api.client';

export interface AuditLogQuery {
  period?: string;
  unitId?: string;
  limit?: number;
}

export function createAuditApi(http: HttpClient) {
  return {
    /** GET /api/audit-logs?period=&unitId=&limit= — entries are written by the server. */
    list: (query: AuditLogQuery = {}) => http.get<AuditLogListResponse>('/api/audit-logs', { ...query }),
  };
}

export type AuditApi = ReturnType<typeof createAuditApi>;
