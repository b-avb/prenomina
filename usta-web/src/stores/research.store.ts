import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  CreateResearchAllocationDto,
  ResearchAllocationAnnex7,
  ResearchMutationResponse,
  UpdateResearchAllocationDto,
} from '@usta/domain';
import { useMutation, type MutationResult } from '@/composables/useMutation';
import { researchApi } from '@/services/api';
import { useOrganizationStore } from './organization.store';
import { findIndexById, restoreAt, upsertById } from './utils/collection.utils';
import { useWorkloadStore } from './workload.store';

export type ResearchAllocationPatch = Omit<UpdateResearchAllocationDto, 'id'>;

export const useResearchStore = defineStore('research', () => {
  const orgStore = useOrganizationStore();
  const workloadStore = useWorkloadStore();
  const { runOptimistic, runPessimistic, reject } = useMutation();

  const researchAllocations = ref<ResearchAllocationAnnex7[]>([]);

  function hydrate(snapshotAllocations: ResearchAllocationAnnex7[]): void {
    researchAllocations.value = snapshotAllocations;
  }

  /** The server synchronizes the teacher allocation and returns both entities. */
  function commitResearchMutation({ allocation, teacher }: ResearchMutationResponse): void {
    if (allocation) upsertById(researchAllocations.value, allocation, 'start');
    if (teacher) workloadStore.upsertTeacher(teacher);
  }

  function rejectMissingAllocation<T>(): Promise<MutationResult<T>> {
    return reject('NOT_FOUND', 'La asignación de investigación ya no existe');
  }

  function registerResearchAllocation(
    dto: CreateResearchAllocationDto,
  ): Promise<MutationResult<ResearchMutationResponse>> {
    return runPessimistic({
      request: () => researchApi.create(orgStore.activePeriod, dto),
      commit: commitResearchMutation,
      successMessage: `Horas de investigación (${dto.monthlyHours} h en ${dto.code}) precargadas para CC ${dto.documentId}`,
    });
  }

  function updateResearchAllocation(
    id: string,
    patch: ResearchAllocationPatch,
  ): Promise<MutationResult<ResearchMutationResponse>> {
    const item = researchAllocations.value.find((x) => x.id === id);
    if (!item) return rejectMissingAllocation();
    return runOptimistic({
      capture: () => item,
      apply: () => {
        Object.assign(item, patch);
        if (patch.monthlyHours !== undefined) {
          item.weeklyHours = Math.round((item.monthlyHours / 4) * 10) / 10;
        }
      },
      request: () => researchApi.update({ id, ...patch }),
      commit: commitResearchMutation,
      rollback: (previous) => upsertById(researchAllocations.value, previous),
      successMessage: `Asignación de investigación (${patch.code ?? item.code}) actualizada para ${patch.teacherName ?? item.teacherName}`,
    });
  }

  function removeResearchAllocation(id: string): Promise<MutationResult<ResearchMutationResponse>> {
    const index = findIndexById(researchAllocations.value, id);
    const item = researchAllocations.value[index];
    if (!item) return rejectMissingAllocation();
    return runOptimistic({
      capture: () => item,
      apply: () => researchAllocations.value.splice(index, 1),
      request: () => researchApi.remove(id),
      commit: commitResearchMutation,
      rollback: (previous) => restoreAt(researchAllocations.value, index, previous),
      successMessage: `Asignación de investigación (${item.code}) retirada de ${item.teacherName}`,
      successType: 'info',
    });
  }

  return {
    researchAllocations,
    hydrate,
    registerResearchAllocation,
    updateResearchAllocation,
    removeResearchAllocation,
  };
});
