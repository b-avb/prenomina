import type {
  CreateResearchAllocationDto,
  ResearchMutationResponse,
  UpdateResearchAllocationDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createResearchApi(http: HttpClient) {
  return {
    /** POST /api/research?period= */
    create: (period: string, dto: CreateResearchAllocationDto) =>
      http.post<ResearchMutationResponse>('/api/research', dto, { period }),
    /** PUT /api/research/:id */
    update: ({ id, ...body }: UpdateResearchAllocationDto) =>
      http.put<ResearchMutationResponse>(`/api/research/${encodeURIComponent(id)}`, body),
    /** DELETE /api/research/:id — `allocation` is null in the response. */
    remove: (id: string) =>
      http.delete<ResearchMutationResponse>(`/api/research/${encodeURIComponent(id)}`),
  };
}

export type ResearchApi = ReturnType<typeof createResearchApi>;
