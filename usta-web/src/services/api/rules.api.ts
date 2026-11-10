import type {
  BusinessRulesConfig,
  SchedulePhase,
  UpdateRulesConfigDto,
  UpdateSchedulePhaseDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createRulesApi(http: HttpClient) {
  return {
    /** PUT /api/rules-config?period= */
    updateConfig: (period: string, dto: UpdateRulesConfigDto) =>
      http.put<BusinessRulesConfig>('/api/rules-config', dto, { period }),
    /** PUT /api/schedule-phases/:id */
    updateSchedulePhase: ({ id, ...body }: UpdateSchedulePhaseDto) =>
      http.put<SchedulePhase>(`/api/schedule-phases/${encodeURIComponent(id)}`, body),
  };
}

export type RulesApi = ReturnType<typeof createRulesApi>;
