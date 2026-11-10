import type {
  AcademicUnitSummary,
  ChangeUnitStatusDto,
  CreateAcademicUnitDto,
  DeletedResponse,
  SnapshotUnitVersionDto,
  UnitVersionSnapshotResponse,
  UnitWithDirectorResponse,
  UpdateAcademicUnitDto,
  UpdateUnitDeanDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createUnitsApi(http: HttpClient) {
  return {
    /** POST /api/units — creates the unit together with its director teacher. */
    create: (dto: CreateAcademicUnitDto) =>
      http.post<UnitWithDirectorResponse>('/api/units', dto),
    /** PUT /api/units/:id */
    update: ({ id, ...body }: UpdateAcademicUnitDto) =>
      http.put<AcademicUnitSummary>(`/api/units/${encodeURIComponent(id)}`, body),
    /** PUT /api/units/:id/dean — creates or updates the director teacher too. */
    updateDean: ({ unitId, ...body }: UpdateUnitDeanDto) =>
      http.put<UnitWithDirectorResponse>(
        `/api/units/${encodeURIComponent(unitId)}/dean`,
        body,
      ),
    /** PATCH /api/units/:id/status?period= — 'Enviada' snapshots v1 and bumps the version. */
    changeStatus: (period: string, { unitId, ...body }: ChangeUnitStatusDto) =>
      http.patch<UnitVersionSnapshotResponse>(
        `/api/units/${encodeURIComponent(unitId)}/status`,
        body,
        { period },
      ),
    /** POST /api/units/:id/version-snapshot?period= */
    snapshotVersion: (period: string, { unitId }: SnapshotUnitVersionDto) =>
      http.post<UnitVersionSnapshotResponse>(
        `/api/units/${encodeURIComponent(unitId)}/version-snapshot`,
        {},
        { period },
      ),
    /** DELETE /api/units/:id */
    remove: (id: string) =>
      http.delete<DeletedResponse>(`/api/units/${encodeURIComponent(id)}`),
  };
}

export type UnitsApi = ReturnType<typeof createUnitsApi>;
