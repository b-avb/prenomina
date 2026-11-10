import type { SnapshotResponse } from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createSnapshotApi(http: HttpClient) {
  return {
    /** GET /api/state?period= — omitting the period returns the current one. */
    fetch: (period?: string) => http.get<SnapshotResponse>('/api/state', { period }),
  };
}

export type SnapshotApi = ReturnType<typeof createSnapshotApi>;
