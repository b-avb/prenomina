import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AcademicPeriod, PayrollSnapshot } from '@usta/domain';
import { toApiError, useMutation, type MutationResult } from '@/composables/useMutation';
import { useToast } from '@/composables/useToast';
import { periodsApi, snapshotApi } from '@/services/api';
import { useApprovalStore } from './approval.store';
import { useAuditStore } from './audit.store';
import { useAuthStore } from './auth.store';
import { useCatalogStore } from './catalog.store';
import { useOrganizationStore } from './organization.store';
import { useResearchStore } from './research.store';
import { useWorkloadStore } from './workload.store';

const SNAPSHOT_CACHE_KEY = 'usta_payroll_snapshot_cache_v8';
const MIN_VISIBILITY_SYNC_INTERVAL_MS = 30000;

let visibilityListenerRegistered = false;

/**
 * Loads the period read model (`GET /api/state`) into the modular stores.
 * It never writes aggregated state: every write goes through granular endpoints.
 */
export const useStateSyncStore = defineStore('stateSync', () => {
  const authStore = useAuthStore();
  const orgStore = useOrganizationStore();
  const catalogStore = useCatalogStore();
  const workloadStore = useWorkloadStore();
  const approvalStore = useApprovalStore();
  const researchStore = useResearchStore();
  const auditStore = useAuditStore();
  const { showToast } = useToast();
  const { runPessimistic, reject, isMutating } = useMutation();

  const backendConnected = ref<boolean>(false);
  let lastSyncTimestamp = 0;

  function applySnapshot(snapshot: PayrollSnapshot): void {
    orgStore.hydrate(snapshot);
    catalogStore.hydrate(snapshot);
    workloadStore.hydrate(snapshot.teachers);
    approvalStore.hydrate(snapshot.approvalRequests);
    researchStore.hydrate(snapshot.researchAllocations);
    auditStore.hydrate(snapshot.auditLogs);
  }

  /** The local cache is a best-effort read accelerator, never a source of truth. */
  function readCachedSnapshot(): PayrollSnapshot | null {
    const raw = localStorage.getItem(SNAPSHOT_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PayrollSnapshot;
    } catch {
      localStorage.removeItem(SNAPSHOT_CACHE_KEY);
      return null;
    }
  }

  function writeCachedSnapshot(snapshot: PayrollSnapshot): void {
    try {
      localStorage.setItem(SNAPSHOT_CACHE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage quota exceeded: the cache is optional, the fresh snapshot is already applied.
    }
  }

  function clearCache(): void {
    try {
      localStorage.removeItem(SNAPSHOT_CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  async function loadSnapshot(period?: string): Promise<boolean> {
    if (!authStore.isAuthenticated || authStore.mustChangePassword) {
      return false;
    }
    try {
      const snapshot = await snapshotApi.fetch(period);
      applySnapshot(snapshot);
      writeCachedSnapshot(snapshot);
      backendConnected.value = true;
      lastSyncTimestamp = Date.now();
      return true;
    } catch (error) {
      backendConnected.value = false;
      showToast(`No se pudo cargar la prenómina: ${toApiError(error).message}`, 'error');
      return false;
    }
  }

  async function initialize(): Promise<void> {
    if (!authStore.isAuthenticated || authStore.mustChangePassword) {
      return;
    }
    const cached = readCachedSnapshot();
    if (cached) applySnapshot(cached);
    await loadSnapshot(cached?.activePeriod);
  }

  function switchPeriod(code: string): Promise<boolean> {
    if (code === orgStore.activePeriod) return Promise.resolve(true);
    return loadSnapshot(code);
  }

  /** Clones the active period server-side and then loads the new one. */
  async function createPeriod(
    code: string,
    resetStatuses: boolean,
  ): Promise<MutationResult<AcademicPeriod>> {
    if (orgStore.availablePeriods.includes(code)) {
      return reject('CONFLICT', `El periodo académico ${code} ya existe`);
    }
    const result = await runPessimistic({
      request: () =>
        periodsApi.create({ code, sourcePeriod: orgStore.activePeriod, resetStatuses }),
      successMessage: (period) =>
        `Periodo académico ${period.code} creado y activado con los ${catalogStore.sacCodes.length} códigos SAC`,
    });
    if (result.ok) await loadSnapshot(result.data.code);
    return result;
  }

  // Single guarded visibility listener: refreshes the read model when the tab regains
  // focus, but never while a mutation is in flight (it would overwrite optimistic state).
  if (typeof document !== 'undefined' && !visibilityListenerRegistered) {
    visibilityListenerRegistered = true;
    document.addEventListener('visibilitychange', () => {
      if (
        document.visibilityState === 'visible' &&
        authStore.isAuthenticated &&
        !authStore.mustChangePassword &&
        !isMutating.value &&
        Date.now() - lastSyncTimestamp >= MIN_VISIBILITY_SYNC_INTERVAL_MS
      ) {
        void loadSnapshot(orgStore.activePeriod);
      }
    });
  }

  return {
    backendConnected,
    initialize,
    clearCache,
    switchPeriod,
    createPeriod,
  };
});
