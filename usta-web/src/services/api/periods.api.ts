import type { CreatePeriodDto, PeriodResponse } from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createPeriodsApi(http: HttpClient) {
  return {
    /** POST /api/periods — clones the source period server-side. */
    create: (dto: CreatePeriodDto) => http.post<PeriodResponse>('/api/periods', dto),
  };
}

export type PeriodsApi = ReturnType<typeof createPeriodsApi>;
