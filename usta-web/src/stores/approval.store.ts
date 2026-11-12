import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  ApprovalAttachmentResponse,
  ApprovalRequestAnnex3,
  ApprovalStatus,
  CreateApprovalRequestDto,
} from '@usta/domain';
import { toApiError, useMutation, type MutationResult } from '@/composables/useMutation';
import { useToast } from '@/composables/useToast';
import { approvalsApi } from '@/services/api';
import { useOrganizationStore } from './organization.store';
import { replaceById, upsertById } from './utils/collection.utils';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });
}

function extractInternalAttachmentFileName(url: string): string | null {
  const match = /\/api\/approvals\/attachments\/([^/?#]+)$/.exec(url.trim());
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export const useApprovalStore = defineStore('approval', () => {
  const orgStore = useOrganizationStore();
  const { showToast } = useToast();
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

  async function uploadApprovalAttachment(
    file: File,
  ): Promise<MutationResult<ApprovalAttachmentResponse>> {
    const maxBytes = 8 * 1024 * 1024;
    if (file.size <= 0) {
      return reject('VALIDATION_FAILED', 'El archivo adjunto está vacío.');
    }
    if (file.size > maxBytes) {
      return reject(
        'VALIDATION_FAILED',
        'El archivo supera el límite de 8 MB.',
      );
    }
    const contentBase64 = await readFileAsBase64(file);
    return runPessimistic({
      request: () =>
        approvalsApi.uploadAttachment({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          contentBase64,
        }),
      successMessage: (uploaded) =>
        `Soporte "${uploaded.originalName}" adjuntado`,
    });
  }

  async function openApprovalAttachment(attachmentUrl: string): Promise<void> {
    const cleanUrl = attachmentUrl.trim();
    if (!cleanUrl) {
      showToast('Esta solicitud no tiene archivo adjunto.', 'info');
      return;
    }
    const internalFileName = extractInternalAttachmentFileName(cleanUrl);
    if (internalFileName) {
      try {
        const blob = await approvalsApi.downloadAttachmentBlob(internalFileName);
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = internalFileName;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } catch (error) {
        showToast(
          `No se pudo abrir el adjunto: ${toApiError(error).message}`,
          'error',
        );
      }
      return;
    }

    if (/^https?:\/\//i.test(cleanUrl)) {
      const win = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        showToast(
          'El navegador bloqueó la ventana emergente. Permítalas en este sitio para abrir el enlace.',
          'info',
        );
      }
      return;
    }

    showToast('El enlace del soporte adjunto no es válido.', 'error');
  }

  /** The server upserts the pending request for (teacherId, code). */
  function registerApprovalRequest(
    dto: CreateApprovalRequestDto,
  ): Promise<MutationResult<ApprovalRequestAnnex3>> {
    return runPessimistic({
      request: () => approvalsApi.create(orgStore.activePeriod, dto),
      commit: (saved) => upsertById(approvalRequests.value, saved, 'start'),
      successMessage: `Solicitud de aval (${dto.code}) radicada`,
    });
  }

  function decideApprovalRequest(
    id: string,
    status: ApprovalStatus,
    viceRectorNote?: string,
  ): Promise<MutationResult<ApprovalRequestAnnex3>> {
    const request = approvalRequests.value.find((item) => item.id === id);
    if (!request) return reject('NOT_FOUND', 'La solicitud de aval ya no existe');
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
    uploadApprovalAttachment,
    openApprovalAttachment,
    registerApprovalRequest,
    decideApprovalRequest,
  };
});
