import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  ValidationEngineDomain,
  WorkloadBalancerDomain,
  WorkloadCalculatorDomain,
  type AcademicUnitSummary,
  type AssignedAcademicSpace,
  type CreateTeacherPayload,
  type DeletedResponse,
  type FacultyBagIndicator,
  type FacultyTeacher,
  type HourBalanceSuggestion,
  type ImportedTeacherDto,
  type SacCode,
  type UpdateAcademicSpaceDto,
  type UpdateTeacherDto,
  type ValidationAlert,
  type ValidationContext,
} from '@usta/domain';
import {
  useMutation,
  type MutationResult,
  type SuccessMessage,
} from '@/composables/useMutation';
import { teachersApi } from '@/services/api';
import { useApprovalStore } from './approval.store';
import { useAuthStore } from './auth.store';
import { useCatalogStore } from './catalog.store';
import { useOrganizationStore } from './organization.store';
import { findIndexById, restoreAt, upsertById } from './utils/collection.utils';

export type TeacherProfilePayload = CreateTeacherPayload & { expectedWorkload: number };
export type AcademicSpacePatch = Partial<Pick<AssignedAcademicSpace, 'name' | 'level' | 'monthlyHours'>>;

/** Postgraduate spaces are persisted by module hours (4 weeks per month). */
function toPersistedSpaceHours(level: AssignedAcademicSpace['level'], monthlyHours: number): number {
  return level === 'Posgrado' ? monthlyHours * 4 : monthlyHours;
}

function buildProfileDto(teacherId: string, payload: TeacherProfilePayload): UpdateTeacherDto {
  return {
    id: teacherId,
    documentId: payload.documentId.trim(),
    fullName: payload.fullName.trim().toUpperCase(),
    dedication: payload.dedication,
    expectedWorkload: Number(payload.expectedWorkload) || 160,
    rank: payload.rank,
    education: payload.education,
    isProvisional: payload.isProvisional,
    sharedHours: Number(payload.sharedHours) || 0,
    sharedUnitName: payload.sharedUnitName || '',
  };
}

export const useWorkloadStore = defineStore('workload', () => {
  const authStore = useAuthStore();
  const orgStore = useOrganizationStore();
  const catalogStore = useCatalogStore();
  const approvalStore = useApprovalStore();
  const { runOptimistic, runPessimistic, reject } = useMutation();

  const teachers = ref<FacultyTeacher[]>([]);

  const activeUnitTeachers = computed<FacultyTeacher[]>(() =>
    teachers.value.filter((t) => t.unitId === authStore.activeUnitId),
  );

  function hydrate(snapshotTeachers: FacultyTeacher[]): void {
    teachers.value = snapshotTeachers;
  }

  function findTeacher(teacherId: string): FacultyTeacher | undefined {
    return teachers.value.find((item) => item.id === teacherId);
  }

  function upsertTeacher(teacher: FacultyTeacher): void {
    upsertById(teachers.value, teacher);
  }

  /** Replaces the whole roster of a unit with the authoritative server list. */
  function replaceUnitTeachers(unitId: string, unitTeachers: FacultyTeacher[]): void {
    teachers.value = [...teachers.value.filter((t) => t.unitId !== unitId), ...unitTeachers];
  }

  // ─── Calculations & validations (pure domain, live UI feedback) ────────────

  function computeHours40104(teacher: FacultyTeacher): number {
    return WorkloadCalculatorDomain.computeHours40104(teacher);
  }

  function computeHours40006(teacher: FacultyTeacher): number {
    return WorkloadCalculatorDomain.computeHours40006(teacher);
  }

  function computeExactPse25(teacher: FacultyTeacher): number {
    return WorkloadCalculatorDomain.computeExactPse25(teacher, catalogStore.rulesConfig);
  }

  function getEffectivePse(teacher: FacultyTeacher): number {
    return WorkloadCalculatorDomain.getEffectivePse(teacher, catalogStore.rulesConfig);
  }

  function computeOtherSacHours(teacher: FacultyTeacher): number {
    return WorkloadCalculatorDomain.computeOtherSacHours(teacher);
  }

  const totalHoursByTeacherId = computed<ReadonlyMap<string, number>>(() => {
    const map = new Map<string, number>();
    for (const teacher of teachers.value) {
      map.set(
        teacher.id,
        WorkloadCalculatorDomain.computeTeacherTotalHours(teacher, catalogStore.rulesConfig),
      );
    }
    return map;
  });

  function computeTeacherTotalHours(teacher: FacultyTeacher): number {
    const cached = totalHoursByTeacherId.value.get(teacher.id);
    if (cached !== undefined && findTeacher(teacher.id) === teacher) {
      return cached;
    }
    return WorkloadCalculatorDomain.computeTeacherTotalHours(
      teacher,
      catalogStore.rulesConfig,
    );
  }

  function getEffectiveCodeCap(definition: SacCode, unit?: AcademicUnitSummary): number | null {
    return ValidationEngineDomain.resolveEffectiveCodeCap(
      definition,
      unit ?? orgStore.activeUnit,
      catalogStore.rulesConfig,
    );
  }

  function sumCodeInUnit(unitId: string, code: string): number {
    return WorkloadCalculatorDomain.sumCodeInUnit(
      teachers.value,
      unitId,
      code,
      catalogStore.rulesConfig,
    );
  }

  const teacherCountsByUnitId = computed<ReadonlyMap<string, number>>(() => {
    const map = new Map<string, number>();
    for (const teacher of teachers.value) {
      map.set(teacher.unitId, (map.get(teacher.unitId) ?? 0) + 1);
    }
    return map;
  });

  function countUnitTeachers(unitId: string): number {
    return teacherCountsByUnitId.value.get(unitId) ?? 0;
  }

  function getUnitBagIndicators(unitId: string): FacultyBagIndicator[] {
    const unit = orgStore.findUnit(unitId) ?? orgStore.activeUnit;
    return WorkloadCalculatorDomain.computeUnitBagIndicators(
      unit,
      teachers.value,
      catalogStore.rulesConfig,
    );
  }

  const activeUnitBagIndicators = computed<FacultyBagIndicator[]>(() =>
    getUnitBagIndicators(authStore.activeUnitId),
  );

  function validationContext(): ValidationContext {
    return {
      units: orgStore.units,
      teachers: teachers.value,
      sacCodes: catalogStore.sacCodes,
      approvalRequests: approvalStore.approvalRequests,
      rulesConfig: catalogStore.rulesConfig,
    };
  }

  const alertsByTeacherId = computed<ReadonlyMap<string, ValidationAlert[]>>(() => {
    const ctx = validationContext();
    const map = new Map<string, ValidationAlert[]>();
    for (const teacher of teachers.value) {
      map.set(teacher.id, ValidationEngineDomain.validateTeacher(teacher, ctx));
    }
    return map;
  });

  const unitAlertsByUnitId = computed<ReadonlyMap<string, ValidationAlert[]>>(() => {
    const ctx = validationContext();
    const map = new Map<string, ValidationAlert[]>();
    for (const unit of orgStore.units) {
      map.set(unit.id, ValidationEngineDomain.getUnitAlerts(unit.id, ctx));
    }
    return map;
  });

  function validateTeacher(teacher: FacultyTeacher): ValidationAlert[] {
    const cached = alertsByTeacherId.value.get(teacher.id);
    if (cached !== undefined && findTeacher(teacher.id) === teacher) {
      return cached;
    }
    return ValidationEngineDomain.validateTeacher(teacher, validationContext());
  }

  function getUnitAlerts(unitId: string): ValidationAlert[] {
    return (
      unitAlertsByUnitId.value.get(unitId) ??
      ValidationEngineDomain.getUnitAlerts(unitId, validationContext())
    );
  }

  function countActiveUnitAlerts(unitId: string): number {
    return getUnitAlerts(unitId).filter(
      (a) => a.severity === 'blocking' || a.severity === 'alert',
    ).length;
  }

  const activeUnitAlerts = computed<ValidationAlert[]>(() =>
    getUnitAlerts(authStore.activeUnitId),
  );

  function suggestTeacherHourBalance(teacherId: string): HourBalanceSuggestion[] {
    const teacher = findTeacher(teacherId);
    if (!teacher) return [];
    const unit = orgStore.findUnit(teacher.unitId) ?? orgStore.activeUnit;
    return WorkloadBalancerDomain.suggestTeacherHourBalance(
      teacher,
      unit,
      teachers.value,
      catalogStore.sacCodes,
      catalogStore.rulesConfig,
    );
  }

  // ─── Mutations (server is authoritative) ──────────────────────────────────

  function rejectMissingTeacher<T>(): Promise<MutationResult<T>> {
    return reject('NOT_FOUND', 'El docente ya no existe en la prenómina del periodo activo');
  }

  /** Optimistic edit of a single teacher reconciled with the teacher returned by the server. */
  function mutateTeacher(
    teacherId: string,
    apply: (teacher: FacultyTeacher) => void,
    request: () => Promise<FacultyTeacher>,
    successMessage?: SuccessMessage<FacultyTeacher>,
  ): Promise<MutationResult<FacultyTeacher>> {
    const teacher = findTeacher(teacherId);
    if (!teacher) return rejectMissingTeacher();
    return runOptimistic({
      capture: () => teacher,
      apply: () => apply(teacher),
      request,
      commit: upsertTeacher,
      rollback: upsertTeacher,
      successMessage,
    });
  }

  function addAcademicSpace(
    teacherId: string,
    name: string,
    level: AssignedAcademicSpace['level'],
    hours: number,
  ): Promise<MutationResult<FacultyTeacher>> {
    if (!findTeacher(teacherId)) return rejectMissingTeacher();
    return runPessimistic({
      request: () =>
        teachersApi.addSpace({ teacherId, name: name.toUpperCase(), level, hours }),
      commit: upsertTeacher,
      successMessage: (saved) => `Espacio "${name}" agregado a ${saved.fullName}`,
    });
  }

  function updateAcademicSpace(
    teacherId: string,
    spaceId: string,
    patch: AcademicSpacePatch,
  ): Promise<MutationResult<FacultyTeacher>> {
    const space = findTeacher(teacherId)?.academicSpaces.find((item) => item.id === spaceId);
    if (!space) return reject('NOT_FOUND', 'El espacio académico ya no existe');
    const level = patch.level ?? space.level;
    const monthlyHours = patch.monthlyHours ?? space.monthlyHours;
    const dto: UpdateAcademicSpaceDto = {
      teacherId,
      spaceId,
      name: patch.name,
      level: patch.level,
      hours:
        patch.level !== undefined || patch.monthlyHours !== undefined
          ? toPersistedSpaceHours(level, monthlyHours)
          : undefined,
    };
    return mutateTeacher(
      teacherId,
      (teacher) => {
        Object.assign(space, patch);
        WorkloadBalancerDomain.syncPostgraduateAllocations(teacher);
      },
      () => teachersApi.updateSpace(dto),
    );
  }

  function removeAcademicSpace(
    teacherId: string,
    spaceId: string,
  ): Promise<MutationResult<FacultyTeacher>> {
    return mutateTeacher(
      teacherId,
      (teacher) => {
        teacher.academicSpaces = teacher.academicSpaces.filter((s) => s.id !== spaceId);
        WorkloadBalancerDomain.syncPostgraduateAllocations(teacher);
      },
      () => teachersApi.removeSpace(teacherId, spaceId),
      'Espacio académico eliminado',
    );
  }

  function autoFixTeacherPse(teacherId: string): Promise<MutationResult<FacultyTeacher>> {
    return mutateTeacher(
      teacherId,
      (teacher) => {
        teacher.pseManualOverride = null;
      },
      () => teachersApi.update({ id: teacherId, pseManualOverride: null }),
      (saved) => `PSE ajustado automáticamente (${computeExactPse25(saved)} h)`,
    );
  }

  function updateCodeAllocation(
    teacherId: string,
    code: string,
    hours: number,
    justification?: string,
    directorNote?: string,
  ): Promise<MutationResult<FacultyTeacher>> {
    return mutateTeacher(
      teacherId,
      (teacher) => {
        const existing = teacher.allocations[code];
        if (hours <= 0) {
          delete teacher.allocations[code];
          return;
        }
        teacher.allocations[code] = {
          ...existing,
          code,
          hours,
          exceptionJustification: justification ?? existing?.exceptionJustification,
          directorNote: directorNote ?? existing?.directorNote,
          adjustedByDirector:
            authStore.activeRole === 'director' ? true : existing?.adjustedByDirector,
        };
      },
      () =>
        teachersApi.updateAllocation({
          teacherId,
          code,
          hours,
          exceptionJustification: justification,
          directorNote,
        }),
    );
  }

  function createTeacher(
    unitId: string,
    payload: CreateTeacherPayload,
  ): Promise<MutationResult<FacultyTeacher>> {
    return runPessimistic({
      request: () => teachersApi.create(orgStore.activePeriod, { ...payload, unitId }),
      commit: (created) => teachers.value.push(created),
      successMessage: (created) =>
        `Docente "${created.fullName}" registrado en ${orgStore.findUnit(unitId)?.name ?? unitId}`,
    });
  }

  function updateTeacherProfile(
    teacherId: string,
    payload: TeacherProfilePayload,
  ): Promise<MutationResult<FacultyTeacher>> {
    const dto = buildProfileDto(teacherId, payload);
    return mutateTeacher(
      teacherId,
      (teacher) => Object.assign(teacher, dto),
      () => teachersApi.update(dto),
      (saved) => `Ficha de ${saved.fullName} actualizada`,
    );
  }

  function removeTeacher(teacherId: string): Promise<MutationResult<DeletedResponse>> {
    const index = findIndexById(teachers.value, teacherId);
    const teacher = teachers.value[index];
    if (!teacher) return rejectMissingTeacher();
    return runOptimistic({
      capture: () => teacher,
      apply: () => teachers.value.splice(index, 1),
      request: () => teachersApi.remove(teacherId),
      rollback: (previous) => restoreAt(teachers.value, index, previous),
      successMessage: `Docente ${teacher.fullName} retirado de la prenómina`,
      successType: 'info',
    });
  }

  function importRoster(
    unitId: string,
    fileName: string,
    importedTeachers: ImportedTeacherDto[],
  ): Promise<MutationResult<FacultyTeacher[]>> {
    return runPessimistic({
      request: () =>
        teachersApi.importRoster(orgStore.activePeriod, {
          unitId,
          fileName,
          teachers: importedTeachers,
        }),
      commit: (roster) => replaceUnitTeachers(unitId, roster),
      successMessage: (roster) =>
        `Se importaron ${roster.length} docentes desde "${fileName}" a ${orgStore.findUnit(unitId)?.name ?? unitId}`,
    });
  }

  return {
    teachers,
    activeUnitTeachers,
    activeUnitBagIndicators,
    activeUnitAlerts,
    totalHoursByTeacherId,
    alertsByTeacherId,
    hydrate,
    findTeacher,
    upsertTeacher,
    replaceUnitTeachers,
    computeHours40104,
    computeHours40006,
    computeExactPse25,
    getEffectivePse,
    computeOtherSacHours,
    computeTeacherTotalHours,
    getEffectiveCodeCap,
    sumCodeInUnit,
    countUnitTeachers,
    getUnitBagIndicators,
    validateTeacher,
    getUnitAlerts,
    countActiveUnitAlerts,
    suggestTeacherHourBalance,
    addAcademicSpace,
    updateAcademicSpace,
    removeAcademicSpace,
    autoFixTeacherPse,
    updateCodeAllocation,
    createTeacher,
    updateTeacherProfile,
    removeTeacher,
    importRoster,
  };
});
