import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AcademicPeriod, PayrollSnapshot } from '@usta/domain';
import { DEFAULT_RULES_CONFIG } from '@/constants/payroll.constants';
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

const SNAPSHOT_CACHE_PREFIX = 'usta_payroll_snapshot_cache_v9';
const LEGACY_CACHE_KEY = 'usta_payroll_snapshot_cache_v8';
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
  let inFlightInit: Promise<void> | null = null;

  function cacheKeyForCurrentUser(): string | null {
    const userId = authStore.currentUser?.id;
    return userId ? `${SNAPSHOT_CACHE_PREFIX}:${userId}` : null;
  }

  function applySnapshot(snapshot: PayrollSnapshot): void {
    orgStore.hydrate(snapshot);
    catalogStore.hydrate(snapshot);
    workloadStore.hydrate(snapshot.teachers);
    approvalStore.hydrate(snapshot.approvalRequests);
    researchStore.hydrate(snapshot.researchAllocations);
    auditStore.hydrate(snapshot.auditLogs);
  }

  /** The local cache is a best-effort read accelerator scoped per authenticated user. */
  function readCachedSnapshot(): PayrollSnapshot | null {
    const key = cacheKeyForCurrentUser();
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as PayrollSnapshot;
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
      return null;
    }
  }

  function writeCachedSnapshot(snapshot: PayrollSnapshot): void {
    const key = cacheKeyForCurrentUser();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // Storage quota exceeded: the cache is optional, the fresh snapshot is already applied.
    }
  }

  function clearCache(): void {
    try {
      localStorage.removeItem(LEGACY_CACHE_KEY);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SNAPSHOT_CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    } catch {
      // Ignore storage errors
    }
  }

  function reset(): void {
    clearCache();
    backendConnected.value = false;
    lastSyncTimestamp = 0;
    inFlightInit = null;
    orgStore.hydrate({
      activePeriod: '',
      currentPeriod: '',
      availablePeriods: [],
      schedulePhases: [],
      units: [],
      programQuotas: [],
    });
    catalogStore.hydrate({
      sacCodes: [],
      rulesConfig: { ...DEFAULT_RULES_CONFIG },
    });
    workloadStore.hydrate([]);
    approvalStore.hydrate([]);
    researchStore.hydrate([]);
    auditStore.hydrate([]);
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

  function initialize(): Promise<void> {
    if (!authStore.isAuthenticated || authStore.mustChangePassword) {
      return Promise.resolve();
    }
    if (inFlightInit) {
      return inFlightInit;
    }
    inFlightInit = (async () => {
      try {
        const cached = readCachedSnapshot();
        if (cached) applySnapshot(cached);
        await loadSnapshot(cached?.activePeriod);
      } finally {
        inFlightInit = null;
      }
    })();
    return inFlightInit;
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
      return reject('CONFLICT', `El periodo ${code} ya existe`);
    }
    const result = await runPessimistic({
      request: () =>
        periodsApi.create({ code, sourcePeriod: orgStore.activePeriod, resetStatuses }),
      successMessage: (period) => `Periodo ${period.code} abierto y activo`,
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
    reset,
    switchPeriod,
    createPeriod,
  };
});
