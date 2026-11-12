<script setup lang="ts">
import { ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { usePeriodSelect } from '@/composables/usePeriodSelect';
import type { AcademicUnitSummary, ProgramQuotaAnnex5, SacCode } from '@usta/domain';
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
  importCatalogAnnexes456FromXlsx,
  type ImportedCatalogAnnexes456Result,
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
const editingProgramModel = ref<ProgramQuotaAnnex5 | null>(null);
const issuedCredentials = ref<{
  title: string;
  fullName: string;
  unitName: string;
  username: string;
  temporaryPassword: string;
} | null>(null);

async function copyIssuedCredentials() {
  if (!issuedCredentials.value) return;
  const text = `Unidad: ${issuedCredentials.value.unitName}\nResponsable: ${issuedCredentials.value.fullName}\nUsuario: ${issuedCredentials.value.username}\nContraseña temporal: ${issuedCredentials.value.temporaryPassword}`;
  try {
    await navigator.clipboard.writeText(text);
    store.showToast('Credenciales copiadas al portapapeles');
  } catch {
    store.showToast('Copie manualmente la contraseña temporal mostrada', 'info');
  }
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function matchUnitByName(rawName: string): AcademicUnitSummary | undefined {
  const target = normalizeText(rawName);
  if (!target) return undefined;
  return (
    store.units.find((u) => normalizeText(u.name) === target) ??
    store.units.find(
      (u) =>
        normalizeText(u.name).includes(target) || target.includes(normalizeText(u.name)),
    )
  );
}

function openClonePeriodModal(): void {
  newPeriodInput.value = suggestNextPeriodCode(store.activePeriod);
  isPeriodModalOpen.value = true;
}

function openNewProgramModal(): void {
  editingProgramModel.value = null;
  isNewProgramModalOpen.value = true;
}

function openEditProgramModal(program: ProgramQuotaAnnex5): void {
  editingProgramModel.value = program;
  isNewProgramModalOpen.value = true;
}

function closeProgramModal(): void {
  isNewProgramModalOpen.value = false;
  editingProgramModel.value = null;
}

async function handleSaveNewPeriod() {
  if (!newPeriodInput.value.trim()) {
    store.showToast('Indique el código del nuevo periodo', 'error');
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
  store.showToast('Catálogo descargado');
}

const catalogFileInput = ref<HTMLInputElement | null>(null);

async function handleImportCatalogExcel(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  let parsed: ImportedCatalogAnnexes456Result;
  try {
    parsed = await importCatalogAnnexes456FromXlsx(file);
  } catch {
    store.showToast('No se pudo leer el archivo Excel seleccionado', 'error');
    return;
  } finally {
    input.value = '';
  }

  if (
    parsed.sacCodes.length === 0 &&
    parsed.programs.length === 0 &&
    parsed.unitQuotas.length === 0
  ) {
    store.showToast(
      'El archivo no contiene datos válidos para el catálogo o los cupos',
      'error',
    );
    return;
  }

  if (parsed.sacCodes.length > 0) {
    await store.importSacCodes(parsed.sacCodes);
  }

  let syncedPrograms = 0;
  const unitsTouchedByAnnex5 = new Set<string>();
  for (const row of parsed.programs) {
    const unit = matchUnitByName(row.unitName);
    if (!unit) continue;
    unitsTouchedByAnnex5.add(unit.id);
    const existing = store.programQuotas.find(
      (p) =>
        p.unitId === unit.id &&
        normalizeText(p.programName) === normalizeText(row.programName),
    );
    if (existing) {
      const res = await store.updateProgram(existing.id, {
        programName: row.programName,
        level: row.level,
        modality: row.modality,
        accreditationStatus: row.accreditationStatus,
        quality30411: row.quality30411,
        curriculum40106: row.curriculum40106,
        sea40109: row.sea40109,
        saberPro40127: row.saberPro40127,
        isActive: row.isActive,
      });
      if (res.ok) syncedPrograms++;
    } else {
      const res = await store.createProgram({
        unitId: unit.id,
        programName: row.programName,
        level: row.level,
        modality: row.modality,
        accreditationStatus: row.accreditationStatus,
        quality30411: row.quality30411,
        curriculum40106: row.curriculum40106,
        sea40109: row.sea40109,
        saberPro40127: row.saberPro40127,
        isActive: row.isActive,
      });
      if (res.ok) syncedPrograms++;
    }
  }

  let syncedUnits = 0;
  for (const row of parsed.unitQuotas) {
    const unit = matchUnitByName(row.unitName);
    if (!unit) continue;
    const hasProgramsInUnit =
      unitsTouchedByAnnex5.has(unit.id) ||
      store.programQuotas.some((p) => p.unitId === unit.id && p.isActive);
    const patch: Parameters<typeof store.updateUnit>[1] = {
      ...(row.division ? { division: row.division } : {}),
      ...(row.graduatesCap20502 !== undefined
        ? { graduatesCap20502: row.graduatesCap20502 }
        : {}),
      ...(!hasProgramsInUnit && row.qualityCap30411 !== undefined
        ? { qualityCap30411: row.qualityCap30411 }
        : {}),
      ...(!hasProgramsInUnit && row.curriculumCap40106 !== undefined
        ? { curriculumCap40106: row.curriculumCap40106 }
        : {}),
      ...(!hasProgramsInUnit && row.seaCap40109 !== undefined
        ? { seaCap40109: row.seaCap40109 }
        : {}),
      ...(!hasProgramsInUnit && row.saberProCap40127 !== undefined
        ? { saberProCap40127: row.saberProCap40127 }
        : {}),
    };
    if (Object.keys(patch).length > 0) {
      const res = await store.updateUnit(unit.id, patch);
      if (res.ok) syncedUnits++;
    }
  }

  if (syncedPrograms > 0 || syncedUnits > 0) {
    store.showToast(
      `Importación completada: ${syncedPrograms} ${syncedPrograms === 1 ? 'programa actualizado' : 'programas actualizados'}, ${syncedUnits} ${syncedUnits === 1 ? 'unidad actualizada' : 'unidades actualizadas'}`,
    );
  }
}
</script>

<template>
  <div>
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          CONFIGURACIÓN INSTITUCIONAL · PERIODO {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Catálogo SAC, cupos y criterios de validación
        </h1>
      </div>
      <div class="page-actions">
        <div style="display: flex; align-items: center; gap: 6px">
          <select
            :value="store.activePeriod"
            class="control-sm"
            title="Periodo académico activo"
            @change="onPeriodChange"
          >
            <option v-for="per in store.availablePeriods" :key="per" :value="per">
              Periodo {{ per }}
            </option>
          </select>
          <button class="btn accent small" style="height: 34px" @click="openClonePeriodModal">
            Abrir periodo
          </button>
        </div>
        <input
          ref="catalogFileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          style="display: none"
          @change="handleImportCatalogExcel"
        />
        <button
          class="btn ghost small"
          title="Importar códigos SAC, programas y cupos (.xlsx)"
          @click="catalogFileInput?.click()"
        >
          Importar catálogo
        </button>
        <button class="btn ghost small" @click="handleExportCatalogExcel">
          Exportar catálogo
        </button>
        <button class="btn primary small" @click="isNewCodeModalOpen = true">
          Nuevo código SAC
        </button>
      </div>
    </div>

    <div class="tabs" style="margin-bottom: 14px">
      <button
        class="tab"
        :class="{ active: activeTab === 'annex4' }"
        @click="activeTab = 'annex4'"
      >
        Códigos SAC ({{ store.sacCodes.length }})
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'faculty_quotas' }"
        @click="activeTab = 'faculty_quotas'"
      >
        Cupos por unidad ({{ store.units.length }})
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'programs_annex5' }"
        @click="activeTab = 'programs_annex5'"
      >
        Programas y cohortes
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'institutional_rules' }"
        @click="activeTab = 'institutional_rules'"
      >
        Criterios de validación
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
      @new-program="openNewProgramModal"
      @edit-program="openEditProgramModal"
    />
    <InstitutionalRulesPanel v-else />

    <!-- MODALS -->
    <SacCodeConfigModal :code-item="editingCode" @close="editingCode = null" />
    <SacCodeCreateModal :open="isNewCodeModalOpen" @close="isNewCodeModalOpen = false" />
    <AcademicUnitFormModal
      :open="isNewUnitModalOpen"
      @close="isNewUnitModalOpen = false"
      @issued-credentials="(payload) => (issuedCredentials = payload)"
    />
    <AcademicProgramFormModal
      :open="isNewProgramModalOpen"
      :editing-program="editingProgramModel"
      @close="closeProgramModal"
    />

    <!-- Open Period Modal -->
    <UstaModal
      :open="isPeriodModalOpen"
      title="Abrir nuevo periodo"
      subtitle="Se conservarán el catálogo SAC, los criterios de validación y los cupos de horas vigentes."
      @close="isPeriodModalOpen = false"
    >
      <div class="field">
        <label>Código del periodo</label>
        <input v-model="newPeriodInput" type="text" placeholder="Ej. 2027-1" />
      </div>
      <label class="toggle" style="margin: 10px 0">
        <input v-model="resetStatusesOnClone" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">
          Iniciar las {{ store.units.length }} unidades en estado Borrador
        </span>
      </label>

      <template #actions>
        <button type="button" class="btn ghost" @click="isPeriodModalOpen = false">Cancelar</button>
        <button type="button" class="btn primary" @click="handleSaveNewPeriod">
          Abrir periodo
        </button>
      </template>
    </UstaModal>

    <!-- Persistent Credentials Modal -->
    <UstaModal
      :open="!!issuedCredentials"
      :title="issuedCredentials?.title ?? 'Credenciales temporales'"
      subtitle="Entregue esta clave temporal al responsable. Solo se muestra una vez y deberá cambiarse en el primer ingreso."
      @close="issuedCredentials = null"
    >
      <template v-if="issuedCredentials">
        <div
          style="background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: grid; gap: 10px"
        >
          <div>
            <div style="font-size: 11px; color: var(--ink-soft)">Unidad académica</div>
            <b style="color: var(--navy); font-size: 13.5px">{{ issuedCredentials.unitName }}</b>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--ink-soft)">Responsable</div>
            <b style="font-size: 13px">{{ issuedCredentials.fullName }}</b>
          </div>
          <div class="grid cols-2" style="gap: 10px">
            <div>
              <div style="font-size: 11px; color: var(--ink-soft); margin-bottom: 3px">
                Usuario institucional
              </div>
              <input
                :value="issuedCredentials.username"
                type="text"
                readonly
                style="font-family: var(--font-mono); font-weight: 700"
              />
            </div>
            <div>
              <div style="font-size: 11px; color: var(--ink-soft); margin-bottom: 3px">
                Contraseña temporal
              </div>
              <input
                :value="issuedCredentials.temporaryPassword"
                type="text"
                readonly
                style="font-family: var(--font-mono); font-weight: 800; color: var(--navy)"
              />
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <button type="button" class="btn accent" @click="copyIssuedCredentials">
          Copiar credenciales
        </button>
        <button type="button" class="btn primary" @click="issuedCredentials = null">
          Cerrar
        </button>
      </template>
    </UstaModal>
  </div>
</template>
