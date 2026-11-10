import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  AcademicOrganizationDomain,
  type AcademicUnitSummary,
  type CreateAcademicProgramDto,
  type PayrollSnapshot,
  type ProgramMutationResponse,
  type ProgramQuotaAnnex5,
  type SchedulePhase,
  type UpdateAcademicProgramDto,
  type UpdateAcademicUnitDto,
} from '@usta/domain';
import { useMutation, type MutationResult } from '@/composables/useMutation';
import { useToast } from '@/composables/useToast';
import { FALLBACK_ACADEMIC_UNIT } from '@/constants/payroll.constants';
import { programsApi, rulesApi, unitsApi } from '@/services/api';
import { useAuthStore } from './auth.store';
import { findIndexById, replaceById, restoreAt, upsertById } from './utils/collection.utils';

export type UnitPatch = Omit<UpdateAcademicUnitDto, 'id'>;
export type ProgramPatch = Omit<UpdateAcademicProgramDto, 'id'>;

type OrganizationSnapshot = Pick<
  PayrollSnapshot,
  'activePeriod' | 'currentPeriod' | 'availablePeriods' | 'schedulePhases' | 'units' | 'programQuotas'
>;

function isSamePhase(a: SchedulePhase, b: SchedulePhase): boolean {
  return (
    a.label === b.label &&
    a.title === b.title &&
    a.dateRange === b.dateRange &&
    a.status === b.status
  );
}

export const useOrganizationStore = defineStore('organization', () => {
  const authStore = useAuthStore();
  const { showToast } = useToast();
  const { runOptimistic, runPessimistic, reject } = useMutation();

  const activePeriod = ref<string>('');
  const currentPeriod = ref<string>('');
  const availablePeriods = ref<string[]>([]);
  const schedulePhases = ref<SchedulePhase[]>([]);
  const units = ref<AcademicUnitSummary[]>([]);
  const programQuotas = ref<ProgramQuotaAnnex5[]>([]);

  const activeUnit = computed<AcademicUnitSummary>(
    () =>
      units.value.find((u) => u.id === authStore.activeUnitId) ??
      units.value[0] ??
      FALLBACK_ACADEMIC_UNIT,
  );

  function hydrate(snapshot: OrganizationSnapshot): void {
    activePeriod.value = snapshot.activePeriod;
    currentPeriod.value = snapshot.currentPeriod;
    availablePeriods.value = snapshot.availablePeriods;
    schedulePhases.value = snapshot.schedulePhases;
    units.value = snapshot.units;
    programQuotas.value = snapshot.programQuotas;
    if (
      !authStore.activeUnitId ||
      !snapshot.units.some((u) => u.id === authStore.activeUnitId)
    ) {
      authStore.setActiveUnit(
        authStore.currentUser?.unitId || snapshot.units[0]?.id || '',
      );
    }
  }

  function findUnit(unitId: string): AcademicUnitSummary | undefined {
    return units.value.find((unit) => unit.id === unitId);
  }

  function upsertUnit(unit: AcademicUnitSummary): void {
    upsertById(units.value, unit);
  }

  /** Live preview of the Annex 5 caps while the server recalculates them. */
  function previewUnitCaps(unitId: string): void {
    const unit = findUnit(unitId);
    if (unit) AcademicOrganizationDomain.recalculateUnitCapsFromPrograms(unit, programQuotas.value);
  }

  function commitProgramMutation({ program, unit }: ProgramMutationResponse): void {
    if (program) upsertById(programQuotas.value, program, 'start');
    upsertUnit(unit);
  }

  function updateUnit(unitId: string, patch: UnitPatch): Promise<MutationResult<AcademicUnitSummary>> {
    const unit = findUnit(unitId);
    if (!unit) return reject('NOT_FOUND', 'La unidad académica ya no existe en el periodo activo');
    return runOptimistic({
      capture: () => unit,
      apply: () => Object.assign(unit, patch),
      request: () => unitsApi.update({ id: unitId, ...patch }),
      commit: upsertUnit,
      rollback: upsertUnit,
    });
  }

  function createProgram(
    dto: CreateAcademicProgramDto,
  ): Promise<MutationResult<ProgramMutationResponse>> {
    return runPessimistic({
      request: () => programsApi.create(dto),
      commit: commitProgramMutation,
      successMessage: ({ unit }) =>
        `Programa "${dto.programName}" agregado y sincronizado con la bolsa de ${unit.name}`,
    });
  }

  function updateProgram(
    programId: string,
    patch: ProgramPatch,
  ): Promise<MutationResult<ProgramMutationResponse>> {
    const program = programQuotas.value.find((item) => item.id === programId);
    if (!program) return reject('NOT_FOUND', 'El programa académico ya no existe');
    return runOptimistic({
      capture: () => ({ program, unit: findUnit(program.unitId) ?? null }),
      apply: () => {
        Object.assign(program, patch);
        previewUnitCaps(program.unitId);
      },
      request: () => programsApi.update({ id: programId, ...patch }),
      commit: commitProgramMutation,
      rollback: (previous) => {
        replaceById(programQuotas.value, previous.program);
        if (previous.unit) upsertUnit(previous.unit);
      },
    });
  }

  function removeProgram(programId: string): Promise<MutationResult<ProgramMutationResponse>> {
    const index = findIndexById(programQuotas.value, programId);
    const program = programQuotas.value[index];
    if (!program) return reject('NOT_FOUND', 'El programa académico ya no existe');
    return runOptimistic({
      capture: () => ({ program, unit: findUnit(program.unitId) ?? null }),
      apply: () => {
        programQuotas.value.splice(index, 1);
        previewUnitCaps(program.unitId);
      },
      request: () => programsApi.remove(programId),
      commit: commitProgramMutation,
      rollback: (previous) => {
        restoreAt(programQuotas.value, index, previous.program);
        if (previous.unit) upsertUnit(previous.unit);
      },
      successMessage: `Programa "${program.programName}" eliminado y bolsa recalculada`,
      successType: 'info',
    });
  }

  function updateSchedulePhase(draft: SchedulePhase): Promise<MutationResult<SchedulePhase>> {
    const phase = schedulePhases.value.find((item) => item.id === draft.id);
    if (!phase) return reject('NOT_FOUND', 'La fase del cronograma ya no existe');
    return runOptimistic({
      capture: () => phase,
      apply: () => Object.assign(phase, draft),
      request: () => rulesApi.updateSchedulePhase(draft),
      commit: (saved) => replaceById(schedulePhases.value, saved),
      rollback: (previous) => replaceById(schedulePhases.value, previous),
    });
  }

  /** Persists only the phases edited in the schedule form; resolves true when all succeed. */
  async function saveSchedulePhases(drafts: SchedulePhase[]): Promise<boolean> {
    const changed = drafts.filter((draft) => {
      const current = schedulePhases.value.find((phase) => phase.id === draft.id);
      return current !== undefined && !isSamePhase(current, draft);
    });
    const results = await Promise.all(changed.map(updateSchedulePhase));
    const allSucceeded = results.every((result) => result.ok);
    if (allSucceeded) showToast('Cronograma del proceso actualizado');
    return allSucceeded;
  }

  return {
    activePeriod,
    currentPeriod,
    availablePeriods,
    schedulePhases,
    units,
    programQuotas,
    activeUnit,
    hydrate,
    findUnit,
    upsertUnit,
    updateUnit,
    createProgram,
    updateProgram,
    removeProgram,
    saveSchedulePhases,
  };
});
