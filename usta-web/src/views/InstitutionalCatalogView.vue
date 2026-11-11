<script setup lang="ts">
import { ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { usePeriodSelect } from '@/composables/usePeriodSelect';
import type { SacCode } from '@usta/domain';
import UstaModal from '@/components/ui/UstaModal.vue';
import CatalogSacCodesTab from '@/components/domain/CatalogSacCodesTab.vue';
import CatalogFacultyQuotasTab from '@/components/domain/CatalogFacultyQuotasTab.vue';
import CatalogProgramsAnnex5Tab from '@/components/domain/CatalogProgramsAnnex5Tab.vue';
import InstitutionalRulesPanel from '@/components/domain/InstitutionalRulesPanel.vue';
import AcademicUnitFormModal from '@/components/domain/AcademicUnitFormModal.vue';
import AcademicProgramFormModal from '@/components/domain/AcademicProgramFormModal.vue';
import SacCodeConfigModal from '@/components/domain/SacCodeConfigModal.vue';
import SacCodeCreateModal from '@/components/domain/SacCodeCreateModal.vue';
import {
  exportCatalogAnnexes456Xlsx,
  importCatalogAnnex4FromXlsx,
} from '@/services/exporters';

const store = usePayrollStore();
const { onPeriodChange, suggestNextPeriodCode } = usePeriodSelect();

const activeTab = ref<
  'annex4' | 'faculty_quotas' | 'programs_annex5' | 'institutional_rules'
>('annex4');
const editingCode = ref<SacCode | null>(null);
const isNewCodeModalOpen = ref(false);
const isPeriodModalOpen = ref(false);
const newPeriodInput = ref(suggestNextPeriodCode(store.activePeriod));
const resetStatusesOnClone = ref(true);
const isNewUnitModalOpen = ref(false);
const isNewProgramModalOpen = ref(false);

function openClonePeriodModal(): void {
  newPeriodInput.value = suggestNextPeriodCode(store.activePeriod);
  isPeriodModalOpen.value = true;
}

async function handleSaveNewPeriod() {
  if (!newPeriodInput.value.trim()) {
    store.showToast('Debes ingresar el código del nuevo periodo semestral', 'error');
    return;
  }
  const result = await store.createPeriod(newPeriodInput.value.trim(), resetStatusesOnClone.value);
  if (result.ok) isPeriodModalOpen.value = false;
}

function handleExportCatalogExcel() {
  exportCatalogAnnexes456Xlsx({
    period: store.activePeriod,
    sacCodes: store.sacCodes,
    units: store.units,
    programQuotas: store.programQuotas,
  });
  store.showToast('Catálogo ANEXOS 4, 5 y 6 exportado en Excel (.xlsx)');
}

const catalogFileInput = ref<HTMLInputElement | null>(null);

async function handleImportCatalogExcel(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  let items: Partial<SacCode>[];
  try {
    items = await importCatalogAnnex4FromXlsx(file);
  } catch {
    store.showToast('No se pudo procesar el archivo Excel seleccionado', 'error');
    return;
  } finally {
    input.value = '';
  }
  await store.importSacCodes(items);
}
</script>

<template>
  <div>
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          PARAMETRIZACIÓN INSTITUCIONAL · PERIODO {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Catálogo de Códigos SAC (ANEXO 4) y Topes por Facultad (ANEXOS 5 y 6)
        </h1>
      </div>
      <div class="page-actions">
        <div style="display: flex; align-items: center; gap: 6px">
          <select
            :value="store.activePeriod"
            style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--navy)"
            title="Cambiar periodo académico activo"
            @change="onPeriodChange"
          >
            <option v-for="per in store.availablePeriods" :key="per" :value="per">
              Periodo {{ per }}
            </option>
          </select>
          <button class="btn accent small" @click="openClonePeriodModal">
            + Clonar Periodo
          </button>
        </div>
        <input
          ref="catalogFileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          style="display: none"
          @change="handleImportCatalogExcel"
        />
        <button class="btn ghost small" @click="catalogFileInput?.click()">
          ↑ Cargar Códigos (.xlsx)
        </button>
        <button class="btn ghost small" @click="handleExportCatalogExcel">
          ↓ Exportar ANEXOS 4, 5 y 6 (.xlsx)
        </button>
        <button class="btn primary small" @click="isNewCodeModalOpen = true">
          + Nuevo Código SAC
        </button>
      </div>
    </div>

    <div class="tabs" style="margin-bottom: 14px">
      <button
        class="tab"
        :class="{ active: activeTab === 'annex4' }"
        @click="activeTab = 'annex4'"
      >
        1. Catálogo de Códigos SAC ({{ store.sacCodes.length }} — ANEXO 4)
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'faculty_quotas' }"
        @click="activeTab = 'faculty_quotas'"
      >
        2. Bolsas por Unidad ({{ store.units.length }} — ANEXOS 5 y 6)
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'programs_annex5' }"
        @click="activeTab = 'programs_annex5'"
      >
        3. Desglose por Programa y Cohorte Activa (ANEXO 5)
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'institutional_rules' }"
        @click="activeTab = 'institutional_rules'"
      >
        4. Reglas Institucionales de Validación
      </button>
    </div>

    <CatalogSacCodesTab
      v-if="activeTab === 'annex4'"
      @edit-code="(item) => (editingCode = item)"
    />
    <CatalogFacultyQuotasTab
      v-else-if="activeTab === 'faculty_quotas'"
      @new-unit="isNewUnitModalOpen = true"
    />
    <CatalogProgramsAnnex5Tab
      v-else-if="activeTab === 'programs_annex5'"
      @new-program="isNewProgramModalOpen = true"
    />
    <InstitutionalRulesPanel v-else />

    <!-- MODALS -->
    <SacCodeConfigModal :code-item="editingCode" @close="editingCode = null" />
    <SacCodeCreateModal :open="isNewCodeModalOpen" @close="isNewCodeModalOpen = false" />
    <AcademicUnitFormModal :open="isNewUnitModalOpen" @close="isNewUnitModalOpen = false" />
    <AcademicProgramFormModal
      :open="isNewProgramModalOpen"
      @close="isNewProgramModalOpen = false"
    />

    <!-- Clone Period Modal -->
    <UstaModal
      :open="isPeriodModalOpen"
      title="Clonar Catálogo y Topes a Nuevo Periodo"
      subtitle="Crea un nuevo periodo académico conservando el catálogo de códigos SAC, las reglas de validación y las bolsas semestrales de las unidades académicas."
      @close="isPeriodModalOpen = false"
    >
      <div class="field">
        <label>Código del Nuevo Periodo Semestral</label>
        <input v-model="newPeriodInput" type="text" placeholder="Ej: 2027-1 o 2027-2" />
      </div>
      <label class="toggle" style="margin: 10px 0">
        <input v-model="resetStatusesOnClone" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">
          Reiniciar estados de radicación de las {{ store.units.length }} unidades a "Borrador (v1)"
        </span>
      </label>

      <template #actions>
        <button class="btn ghost" @click="isPeriodModalOpen = false">Cancelar</button>
        <button class="btn primary" @click="handleSaveNewPeriod">
          Clonar y Activar Periodo
        </button>
      </template>
    </UstaModal>
  </div>
</template>
