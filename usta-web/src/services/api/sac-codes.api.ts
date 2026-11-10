import type {
  CreateSacCodeDto,
  DeletedResponse,
  ImportSacCodesDto,
  ImportSacCodesResponse,
  SacCode,
  UpdateSacCodeDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createSacCodesApi(http: HttpClient) {
  return {
    /** POST /api/sac-codes */
    create: (dto: CreateSacCodeDto) => http.post<SacCode>('/api/sac-codes', dto),
    /** POST /api/sac-codes/import */
    importCatalog: (dto: ImportSacCodesDto) =>
      http.post<ImportSacCodesResponse>('/api/sac-codes/import', dto),
    /** PUT /api/sac-codes/:code */
    update: ({ code, ...body }: UpdateSacCodeDto) =>
      http.put<SacCode>(`/api/sac-codes/${encodeURIComponent(code)}`, body),
    /** DELETE /api/sac-codes/:code — `deletedId` is the code. */
    remove: (code: string) =>
      http.delete<DeletedResponse>(`/api/sac-codes/${encodeURIComponent(code)}`),
  };
}

export type SacCodesApi = ReturnType<typeof createSacCodesApi>;
