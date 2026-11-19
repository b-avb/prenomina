<script setup lang="ts">
/**
 * Root application shell: bypasses chrome on `/login`, hosts the global academic period
 * selector and period management modal, and filters primary navigation items by active role.
 */
import { computed, ref } from 'vue';
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router';
import type { PayrollRole, PeriodCopyMode } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import UstaIcon, { type UstaIconName } from '@/components/UstaIcon.vue';
import AuthPasswordChangeModal from '@/components/domain/AuthPasswordChangeModal.vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import UstaToastContainer from '@/components/ui/UstaToastContainer.vue';
import { usePeriodSelect } from '@/composables/usePeriodSelect';
import { resolvePublicAssetUrl } from '@/services/api.client';

const logoUrl = resolvePublicAssetUrl('images/LogoUsta2026.png');

interface NavItem {
  to: string;
  shortLabel: string;
  label: string;
  icon: UstaIconName;
  badge?: number;
  roles: readonly PayrollRole[];
}

const store = usePayrollStore();
const route = useRoute();
const router = useRouter();
const { onPeriodChange, suggestNextPeriodCode } = usePeriodSelect();

const isNewPeriodModalOpen = ref(false);
const newPeriodCodeInput = ref(suggestNextPeriodCode(store.activePeriod));
const newPeriodCopyMode = ref<PeriodCopyMode>('roster_only');
const resetGlobalStatuses = ref(true);
const periodPendingDelete = ref<string | null>(null);

const isChangePasswordModalOpen = ref(false);

const canManageInstitutionalPeriods = computed(
  () => store.activeRole === 'director' || store.activeRole === 'vice_rector',
);

function openNewPeriodModal(): void {
  newPeriodCodeInput.value = suggestNextPeriodCode(store.activePeriod);
  newPeriodCopyMode.value = 'roster_only';
  resetGlobalStatuses.value = true;
  periodPendingDelete.value = null;
  isNewPeriodModalOpen.value = true;
}

async function handleSaveNewGlobalPeriod(): Promise<void> {
  if (!newPeriodCodeInput.value.trim()) {
    store.showToast('Indique el código del nuevo periodo (p. ej., 2027-1)', 'error');
    return;
  }
  const result = await store.createPeriod(
    newPeriodCodeInput.value.trim(),
    newPeriodCopyMode.value === 'full_clone' ? resetGlobalStatuses.value : true,
    newPeriodCopyMode.value,
  );
  if (result.ok) isNewPeriodModalOpen.value = false;
}

async function confirmDeletePeriod(code: string): Promise<void> {
  const res = await store.deletePeriod(code);
  if (res.ok) {
    periodPendingDelete.value = null;
  }
}

async function handleLogout(): Promise<void> {
  store.logout();
  store.showToast('Sesión finalizada', 'info');
  await router.push('/login');
}

const isFullscreenAuthRoute = computed(() => route.path === '/login');

const pendingApprovalsCount = computed(
  () => store.approvalRequests.filter((r) => r.status === 'Pendiente').length,
);

const navItems = computed<NavItem[]>(() => {
  const allItems: NavItem[] = [
    {
      to: '/director/dashboard',
      shortLabel: 'Inicio',
      label: 'Seguimiento seccional',
      icon: 'dashboard',
      roles: ['director', 'vice_rector'],
    },
    {
      to: '/dean/payroll',
      shortLabel: 'Prenómina',
      label: 'Prenómina docente',
      icon: 'prenomina',
      roles: ['director', 'vice_rector', 'dean', 'research'],
    },
    {
      to: '/director/organization',
      shortLabel: 'Unidades',
      label: 'Unidades y programas',
      icon: 'facultades',
      roles: ['director', 'vice_rector'],
    },
    {
      to: '/director/catalog',
      shortLabel: 'Catálogo SAC',
      label: 'Catálogo SAC y cupos',
      icon: 'codigos',
      roles: ['director', 'vice_rector'],
    },
    {
      to: '/vice-rector/approvals',
      shortLabel: 'Avales',
      label: 'Solicitudes de aval',
      icon: 'avales',
      badge: pendingApprovalsCount.value > 0 ? pendingApprovalsCount.value : undefined,
      roles: ['director', 'vice_rector', 'dean'],
    },
    {
      to: '/research/allocations',
      shortLabel: 'Investigación',
      label: 'Asignación de investigación',
      icon: 'investigacion',
      roles: ['director', 'vice_rector', 'research'],
    },
  ];
  return allItems.filter((item) => item.roles.includes(store.activeRole));
});
</script>

<template>
  <RouterView v-if="isFullscreenAuthRoute" />

  <div v-else class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">
        <img :src="logoUrl" class="brand-mark" alt="USTA" />
        <div class="brand-word">
          <b>Prenómina docente</b>
          <span>Universidad Santo Tomás · Tunja</span>
        </div>
        <div
          class="period-pill"
          style="margin-left: 6px; padding: 3px 6px 3px 10px; gap: 6px"
          title="Periodo académico activo"
        >
          <span class="period-pill__dot"></span>
          <select
            :value="store.activePeriod"
            aria-label="Seleccionar periodo académico"
            style="background: transparent; border: none; color: #fff; font-family: var(--font-mono); font-size: 11px; font-weight: 700; cursor: pointer; outline: none; padding-right: 2px"
            @change="onPeriodChange"
          >
            <option
              v-for="per in store.availablePeriods"
              :key="per"
              :value="per"
              style="color: var(--navy); background: #fff"
            >
              {{ per }}
            </option>
          </select>
          <button
            v-if="canManageInstitutionalPeriods"
            type="button"
            title="Gestionar periodos académicos"
            style="background: rgba(255, 255, 255, 0.18); border: none; color: var(--gold); border-radius: 999px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; line-height: 1; cursor: pointer"
            @click="openNewPeriodModal"
          >
            +
          </button>
        </div>
      </div>

      <div class="app-header__right">
        <div class="user-chip">
          <div class="avatar">{{ store.currentUserProfile.initials }}</div>
          <div class="user-chip__text">
            <b>{{ store.currentUserProfile.fullName }}</b>
            <span>{{ store.currentUserProfile.jobTitle }}</span>
          </div>
        </div>

        <button
          type="button"
          class="btn ghost small"
          title="Cambiar contraseña"
          @click="isChangePasswordModalOpen = true"
        >
          Cambiar contraseña
        </button>

        <button type="button" class="btn ghost small" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>
    </header>

    <div class="app-body">
      <nav class="rail rail--labeled" aria-label="Navegación principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rail-item rail-item--labeled"
          :class="{ active: route.path.startsWith(item.to) }"
          :data-label="item.label"
        >
          <div class="rail-item__icon-wrap">
            <UstaIcon :name="item.icon" />
            <span v-if="item.badge" class="rail-item__badge">{{ item.badge }}</span>
          </div>
          <span class="rail-item__text">{{ item.shortLabel }}</span>
        </RouterLink>
      </nav>

      <main class="app-main">
        <div class="main-inner">
          <RouterView />
        </div>
      </main>
    </div>

    <UstaModal
      :open="isNewPeriodModalOpen"
      title="Periodos académicos"
      subtitle="Abra un nuevo periodo definiendo cómo iniciar la planta docente o retire periodos de prueba distintos al periodo base 2026-2."
      max-width="620px"
      @close="isNewPeriodModalOpen = false"
    >
      <div class="field">
        <label>Código del nuevo periodo</label>
        <input
          v-model="newPeriodCodeInput"
          type="text"
          placeholder="Ej. 2027-1"
          @keyup.enter="handleSaveNewGlobalPeriod"
        />
      </div>

      <div class="field" style="margin-top: 10px">
        <label>Datos iniciales del periodo</label>
        <select v-model="newPeriodCopyMode">
          <option value="roster_only">
            Solo decanos y planta docente en 0 h (sin clases ni códigos asignados)
          </option>
          <option value="empty">
            Periodo en blanco sin datos docentes (0 docentes)
          </option>
          <option value="full_clone">
            Clonar carga completa del periodo actual (docentes, clases y códigos)
          </option>
        </select>
      </div>

      <label
        v-if="newPeriodCopyMode === 'full_clone'"
        class="toggle"
        style="margin: 10px 0 6px; padding: 10px 14px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px"
      >
        <input v-model="resetGlobalStatuses" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12.5px; font-weight: 700; color: var(--navy)">
          Iniciar todas las unidades en estado Borrador
        </span>
      </label>

      <div
        v-if="store.availablePeriods.length > 0"
        style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px"
      >
        <div class="section-label" style="margin: 0 0 8px">
          Periodos registrados ({{ store.availablePeriods.length }})
        </div>
        <div style="display: grid; gap: 6px">
          <div
            v-for="per in store.availablePeriods"
            :key="per"
            style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 12px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 8px"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <b style="font-family: var(--font-mono); color: var(--navy)">{{ per }}</b>
              <span v-if="per === store.activePeriod" class="badge avalado" style="font-size: 10px">
                Activo
              </span>
              <span v-if="per === '2026-2'" class="badge inscrito" style="font-size: 10px">
                Base protegido
              </span>
            </div>
            <div v-if="per !== '2026-2'" style="display: flex; align-items: center; gap: 6px">
              <template v-if="periodPendingDelete === per">
                <span style="font-size: 11px; color: var(--danger); font-weight: 700">
                  ¿Eliminar {{ per }}?
                </span>
                <button
                  type="button"
                  class="btn danger small"
                  style="min-height: 26px; padding: 3px 8px; font-size: 11px"
                  @click="confirmDeletePeriod(per)"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  class="btn ghost small"
                  style="min-height: 26px; padding: 3px 8px; font-size: 11px"
                  @click="periodPendingDelete = null"
                >
                  Cancelar
                </button>
              </template>
              <button
                v-else
                type="button"
                class="btn danger small"
                style="min-height: 26px; padding: 3px 10px; font-size: 11px"
                @click="periodPendingDelete = per"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn ghost" @click="isNewPeriodModalOpen = false">
          Cerrar
        </button>
        <button type="button" class="btn primary" @click="handleSaveNewGlobalPeriod">
          Abrir periodo
        </button>
      </template>
    </UstaModal>

    <AuthPasswordChangeModal
      :open="isChangePasswordModalOpen"
      @close="isChangePasswordModalOpen = false"
    />

    <UstaToastContainer />
  </div>
</template>
