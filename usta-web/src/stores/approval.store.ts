import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  ApprovalRequestAnnex3,
  ApprovalStatus,
  CreateApprovalRequestDto,
} from '@usta/domain';
import { useMutation, type MutationResult } from '@/composables/useMutation';
import { approvalsApi } from '@/services/api';
import { useOrganizationStore } from './organization.store';
import { replaceById, upsertById } from './utils/collection.utils';

export const useApprovalStore = defineStore('approval', () => {
  const orgStore = useOrganizationStore();
  const { runOptimistic, runPessimistic, reject } = useMutation();

  const approvalRequests = ref<ApprovalRequestAnnex3[]>([]);

  function hydrate(snapshotRequests: ApprovalRequestAnnex3[]): void {
    approvalRequests.value = snapshotRequests;
  }

  function countPendingApprovals(unitId: string): number {
    return approvalRequests.value.filter(
      (r) => r.unitId === unitId && r.status === 'Pendiente',
    ).length;
  }

  /** The server upserts the pending request for (teacherId, code). */
  function registerApprovalRequest(
    dto: CreateApprovalRequestDto,
  ): Promise<MutationResult<ApprovalRequestAnnex3>> {
    return runPessimistic({
      request: () => approvalsApi.create(orgStore.activePeriod, dto),
      commit: (saved) => upsertById(approvalRequests.value, saved, 'start'),
      successMessage: `Solicitud de Pre-Aval (${dto.code}) enviada a Vicerrectoría Académica`,
    });
  }

  function decideApprovalRequest(
    id: string,
    status: ApprovalStatus,
    viceRectorNote?: string,
  ): Promise<MutationResult<ApprovalRequestAnnex3>> {
    const request = approvalRequests.value.find((item) => item.id === id);
    if (!request) return reject('NOT_FOUND', 'La solicitud de Pre-Aval ya no existe');
    return runOptimistic({
      capture: () => request,
      apply: () => Object.assign(request, { status, viceRectorNote }),
      request: () => approvalsApi.decide({ id, status, viceRectorNote }),
      commit: (saved) => replaceById(approvalRequests.value, saved),
      rollback: (previous) => replaceById(approvalRequests.value, previous),
      successMessage: (saved) => `Solicitud de ${saved.teacherName} (${saved.code}): ${saved.status}`,
    });
  }

  return {
    approvalRequests,
    hydrate,
    countPendingApprovals,
    registerApprovalRequest,
    decideApprovalRequest,
  };
});
