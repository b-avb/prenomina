import type {
  AddAcademicSpaceDto,
  CreateTeacherDto,
  DeletedResponse,
  FacultyTeacher,
  ImportTeachersDto,
  UpdateAcademicSpaceDto,
  UpdateCodeAllocationDto,
  UpdateTeacherDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createTeachersApi(http: HttpClient) {
  return {
    /** POST /api/teachers?period= */
    create: (period: string, dto: CreateTeacherDto) =>
      http.post<FacultyTeacher>('/api/teachers', dto, { period }),
    /** PUT /api/teachers/:id — profile fields only. */
    update: ({ id, ...body }: UpdateTeacherDto) =>
      http.put<FacultyTeacher>(`/api/teachers/${encodeURIComponent(id)}`, body),
    /** DELETE /api/teachers/:id */
    remove: (id: string) =>
      http.delete<DeletedResponse>(`/api/teachers/${encodeURIComponent(id)}`),
    /** POST /api/teachers/:teacherId/spaces */
    addSpace: ({ teacherId, ...body }: AddAcademicSpaceDto) =>
      http.post<FacultyTeacher>(
        `/api/teachers/${encodeURIComponent(teacherId)}/spaces`,
        body,
      ),
    /** PUT /api/teachers/:teacherId/spaces/:spaceId */
    updateSpace: ({ teacherId, spaceId, ...body }: UpdateAcademicSpaceDto) =>
      http.put<FacultyTeacher>(
        `/api/teachers/${encodeURIComponent(teacherId)}/spaces/${encodeURIComponent(spaceId)}`,
        body,
      ),
    /** DELETE /api/teachers/:teacherId/spaces/:spaceId */
    removeSpace: (teacherId: string, spaceId: string) =>
      http.delete<FacultyTeacher>(
        `/api/teachers/${encodeURIComponent(teacherId)}/spaces/${encodeURIComponent(spaceId)}`,
      ),
    /** PUT /api/teachers/:teacherId/allocations/:code */
    updateAllocation: ({ teacherId, code, ...body }: UpdateCodeAllocationDto) =>
      http.put<FacultyTeacher>(
        `/api/teachers/${encodeURIComponent(teacherId)}/allocations/${encodeURIComponent(code)}`,
        body,
      ),
    /** POST /api/units/:id/teachers/import?period= — replaces the unit roster and returns it. */
    importRoster: (period: string, { unitId, ...body }: ImportTeachersDto) =>
      http.post<FacultyTeacher[]>(
        `/api/units/${encodeURIComponent(unitId)}/teachers/import`,
        body,
        { period },
      ),
  };
}

export type TeachersApi = ReturnType<typeof createTeachersApi>;
