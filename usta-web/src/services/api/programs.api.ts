import type {
  CreateAcademicProgramDto,
  ProgramMutationResponse,
  UpdateAcademicProgramDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createProgramsApi(http: HttpClient) {
  return {
    /** POST /api/programs */
    create: (dto: CreateAcademicProgramDto) =>
      http.post<ProgramMutationResponse>('/api/programs', dto),
    /** PUT /api/programs/:id */
    update: ({ id, ...body }: UpdateAcademicProgramDto) =>
      http.put<ProgramMutationResponse>(`/api/programs/${encodeURIComponent(id)}`, body),
    /** DELETE /api/programs/:id — `program` is null in the response. */
    remove: (id: string) =>
      http.delete<ProgramMutationResponse>(`/api/programs/${encodeURIComponent(id)}`),
  };
}

export type ProgramsApi = ReturnType<typeof createProgramsApi>;
