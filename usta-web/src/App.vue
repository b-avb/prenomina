<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router';
import type { PayrollRole } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import UstaIcon, { type UstaIconName } from '@/components/UstaIcon.vue';
import AuthPasswordChangeModal from '@/components/domain/AuthPasswordChangeModal.vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import UstaToastContainer from '@/components/ui/UstaToastContainer.vue';
import { usePeriodSelect } from '@/composables/usePeriodSelect';

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
const resetGlobalStatuses = ref(true);

const isChangePasswordModalOpen = ref(false);

function openNewPeriodModal(): void {
  newPeriodCodeInput.value = suggestNextPeriodCode(store.activePeriod);
  isNewPeriodModalOpen.value = true;
}

async function handleSaveNewGlobalPeriod(): Promise<void> {
  if (!newPeriodCodeInput.value.trim()) {
    store.showToast('Debes ingresar el código del nuevo periodo (ej. 2027-1)', 'error');
    return;
  }
  const result = await store.createPeriod(
    newPeriodCodeInput.value.trim(),
    resetGlobalStatuses.value,
  );
  if (result.ok) isNewPeriodModalOpen.value = false;
}

async function handleLogout(): Promise<void> {
  store.logout();
  store.showToast('Has cerrado sesión correctamente', 'info');
  await router.push('/login');
}

const isFullscreenAuthRoute = computed(
  () =>
    route.path === '/login' ||
    route.path === '/role-selection' ||
    route.path === '/seleccionar-vista',
);

const pendingApprovalsCount = computed(
  () => store.approvalRequests.filter((r) => r.status === 'Pendiente').length,
);

const navItems = computed<NavItem[]>(() => {
  const allItems: NavItem[] = [
    {
      to: '/director/dashboard',
      shortLabel: 'Tablero E&A',
      label: 'Tablero y Bandeja de Revisión E&A',
      icon: 'dashboard',
      roles: ['director', 'vice_rector'],
    },
    {
      to: '/dean/payroll',
      shortLabel: 'Prenómina',
      label: 'Prenómina por Docente y Sábana (ANEXO 2)',
      icon: 'prenomina',
      roles: ['director', 'dean', 'research'],
    },
    {
      to: '/director/organization',
      shortLabel: 'Decanos y Prog.',
      label: 'Gestión de Decanos, Facultades y Programas Académicos',
      icon: 'facultades',
      roles: ['director'],
    },
    {
      to: '/director/catalog',
      shortLabel: 'Catálogo SAC',
      label: 'Catálogo y Topes (ANEXOS 4, 5 y 6)',
      icon: 'codigos',
      roles: ['director'],
    },
    {
      to: '/vice-rector/approvals',
      shortLabel: 'Pre-Avales',
      label: 'Pre-Avales Vicerrectoría (ANEXO 3)',
      icon: 'avales',
      badge: pendingApprovalsCount.value > 0 ? pendingApprovalsCount.value : undefined,
      roles: ['director', 'vice_rector', 'dean'],
    },
    {
      to: '/research/allocations',
      shortLabel: 'Investigación',
      label: 'Investigación Confidencial (ANEXO 7)',
      icon: 'investigacion',
      roles: ['director', 'research'],
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
        <img src="/images/LogoUsta2026.png" class="brand-mark" alt="USTA" />
        <div class="brand-word">
          <b>Gestión Docente · Prenómina</b>
          <span>Santo Tomás · Tunja</span>
        </div>
        <div
          class="period-pill"
          style="margin-left: 6px; padding: 3px 6px 3px 10px; gap: 6px"
          title="Cambiar periodo académico activo o crear nuevo semestre"
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
            v-if="store.currentUser?.role === 'director'"
            type="button"
            title="Crear / Clonar nuevo periodo semestral (ej. 2027-1)"
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
          v-if="store.currentUser?.role === 'director'"
          class="btn accent small"
          @click="router.push('/role-selection')"
        >
          Cambiar vista
        </button>

        <button
          class="btn ghost small"
          title="Actualizar mi contraseña personal"
          @click="isChangePasswordModalOpen = true"
        >
          Mi contraseña
        </button>

        <button class="btn ghost small" @click="handleLogout">Cerrar sesión</button>
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
      title="Crear / Clonar Nuevo Periodo Semestral (RF-08)"
      subtitle="Abre un nuevo semestre (por ejemplo <b>2027-1</b> o <b>2027-2</b>) clonando automáticamente el catálogo vigente de códigos SAC, las reglas de validación y las bolsas de horas de las unidades académicas."
      @close="isNewPeriodModalOpen = false"
    >
      <div class="field">
        <label>Código del Nuevo Periodo Semestral</label>
        <input
          v-model="newPeriodCodeInput"
          type="text"
          placeholder="Ej: 2027-1 o 2027-2"
          @keyup.enter="handleSaveNewGlobalPeriod"
        />
      </div>
      <label
        class="toggle"
        style="margin: 12px 0 18px; padding: 10px 14px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px"
      >
        <input v-model="resetGlobalStatuses" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12.5px; font-weight: 700; color: var(--navy)">
          Reiniciar estados de radicación de las unidades académicas a "Borrador (v1)"
        </span>
      </label>
      <template #footer>
        <button class="btn ghost" @click="isNewPeriodModalOpen = false">Cancelar</button>
        <button class="btn primary" @click="handleSaveNewGlobalPeriod">
          Clonar y Activar Periodo
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
