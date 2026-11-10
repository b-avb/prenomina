import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AuditLogEntry } from '@usta/domain';
import { onMutationSucceeded, toApiError } from '@/composables/useMutation';
import { useToast } from '@/composables/useToast';
import { auditApi } from '@/services/api';
import { useOrganizationStore } from './organization.store';

const REFRESH_DEBOUNCE_MS = 600;

/** Read-only projection of the audit trail; entries are written exclusively by the server. */
export const useAuditStore = defineStore('audit', () => {
  const orgStore = useOrganizationStore();
  const { showToast } = useToast();

  const auditLogs = ref<AuditLogEntry[]>([]);
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  function hydrate(snapshotLogs: AuditLogEntry[]): void {
    auditLogs.value = snapshotLogs;
  }

  async function refresh(): Promise<void> {
    try {
      auditLogs.value = await auditApi.list({ period: orgStore.activePeriod });
    } catch (error) {
      showToast(`No se pudo actualizar la bitácora: ${toApiError(error).message}`, 'error');
    }
  }

  function scheduleRefresh(): void {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      void refresh();
    }, REFRESH_DEBOUNCE_MS);
  }

  onMutationSucceeded(scheduleRefresh);

  return {
    auditLogs,
    hydrate,
  };
});
