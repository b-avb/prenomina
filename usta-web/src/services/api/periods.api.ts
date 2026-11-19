import type {
  CreatePeriodDto,
  DeletePeriodResponse,
  PeriodResponse,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createPeriodsApi(http: HttpClient) {
  return {
    /** POST /api/periods — opens a new period initialized from `sourcePeriod`. */
    create: (dto: CreatePeriodDto) => http.post<PeriodResponse>('/api/periods', dto),
    /** DELETE /api/periods/:code — deletes a non-baseline period (`code !== '2026-2'`). */
    remove: (code: string) =>
      http.delete<DeletePeriodResponse>(`/api/periods/${encodeURIComponent(code)}`),
  };
}

export type PeriodsApi = ReturnType<typeof createPeriodsApi>;
