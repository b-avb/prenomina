<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePayrollStore } from '@/stores/payroll.store';
import OrganizationDeansTab from '@/components/domain/OrganizationDeansTab.vue';
import OrganizationProgramsTab from '@/components/domain/OrganizationProgramsTab.vue';
import AcademicUnitFormModal from '@/components/domain/AcademicUnitFormModal.vue';
import DeanAssignmentModal from '@/components/domain/DeanAssignmentModal.vue';
import AcademicProgramFormModal from '@/components/domain/AcademicProgramFormModal.vue';
import type { AcademicUnitSummary } from '@usta/domain';

const store = usePayrollStore();
const router = useRouter();

const activeTab = ref<'deans' | 'programs'>('deans');
const isNewUnitModalOpen = ref(false);
const isEditDeanModalOpen = ref(false);
const selectedUnitForDean = ref<AcademicUnitSummary | null>(null);
const isNewProgramModalOpen = ref(false);
const defaultUnitForProgram = ref<string>('');

function openEditDeanModal(unit?: AcademicUnitSummary) {
  selectedUnitForDean.value = unit ?? store.units[0] ?? null;
  isEditDeanModalOpen.value = true;
}

function openNewProgramModal(unitId?: string) {
  defaultUnitForProgram.value = unitId ?? store.units[0]?.id ?? '';
  isNewProgramModalOpen.value = true;
}

function navigateToFacultyPayroll(unitId: string) {
  store.selectUnit(unitId);
  router.push('/dean/payroll');
}
</script>

<template>
  <div>
    <!-- MODULE HEADER -->
    <div class="page-head">
      <div>
        <div class="eyebrow">
          DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE · GESTIÓN INSTITUCIONAL · {{ store.activePeriod }}
        </div>
        <h1 class="page-title">Gestión de Decanos, Facultades y Programas Académicos</h1>
      </div>

      <div class="actions-row">
        <button class="btn accent small" @click="openNewProgramModal()">
          + Nuevo Programa Académico
        </button>
        <button class="btn ghost small" @click="openEditDeanModal()">
          Asignar / Cambiar Decano
        </button>
        <button class="btn primary small" @click="isNewUnitModalOpen = true">
          + Nueva Facultad / Decanatura
        </button>
      </div>
    </div>

    <!-- KPI STRIP -->
    <div class="kpi-strip">
      <div class="kpi">
        <div class="kpi__value">{{ store.units.length }}</div>
        <div class="kpi__label">Unidades Académicas y Decanaturas activas</div>
      </div>
      <div class="kpi">
        <div class="kpi__value" style="color: var(--cerulean)">
          {{ store.units.filter((u) => u.hasPostgraduates).length }}
        </div>
        <div class="kpi__label">Facultades con oferta de Posgrado activa</div>
      </div>
      <div class="kpi">
        <div class="kpi__value" style="color: var(--success)">
          {{ store.programQuotas.length }}
        </div>
        <div class="kpi__label">Programas Académicos registrados (Pregrado y Posgrado)</div>
      </div>
      <div class="kpi">
        <div class="kpi__value" style="color: var(--navy)">
          {{ store.programQuotas.filter((p) => p.isActive).length }}
        </div>
        <div class="kpi__label">Cohortes activas que suman a la bolsa semestral (ANEXO 5)</div>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs-bar">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'deans' }"
        @click="activeTab = 'deans'"
      >
        1. Directorio de Decanos y Facultades ({{ store.units.length }})
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'programs' }"
        @click="activeTab = 'programs'"
      >
        2. Programas Académicos y Cohortes ({{ store.programQuotas.length }})
      </button>
    </div>

    <OrganizationDeansTab
      v-if="activeTab === 'deans'"
      @new-unit="isNewUnitModalOpen = true"
      @edit-dean="openEditDeanModal"
      @new-program-for-unit="openNewProgramModal"
      @open-unit-payroll="navigateToFacultyPayroll"
    />

    <OrganizationProgramsTab
      v-else
      @new-program="openNewProgramModal()"
    />

    <!-- MODALS -->
    <AcademicUnitFormModal :open="isNewUnitModalOpen" @close="isNewUnitModalOpen = false" />
    <DeanAssignmentModal
      :open="isEditDeanModalOpen"
      :initial-unit="selectedUnitForDean"
      @close="isEditDeanModalOpen = false"
    />
    <AcademicProgramFormModal
      :open="isNewProgramModalOpen"
      :default-unit-id="defaultUnitForProgram"
      @close="isNewProgramModalOpen = false"
    />
  </div>
</template>
