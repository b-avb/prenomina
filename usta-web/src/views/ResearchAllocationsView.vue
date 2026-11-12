<script setup lang="ts">
/**
 * Annex 7 research and SICDDI allocation management view for the Research Directorate,
 * supporting XLSX matrix import/export and synchronized teacher workload updates.
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import UstaModal from '@/components/ui/UstaModal.vue';
import ResearchAllocationModal from '@/components/domain/ResearchAllocationModal.vue';
import {
  exportResearchMatrixAnnex7Xlsx,
  importResearchMatrixAnnex7FromXlsx,
} from '@/services/exporters';
import { usePayrollStore } from '@/stores/payroll.store';
import type { ResearchAllocationAnnex7 } from '@usta/domain';

const store = usePayrollStore();
const router = useRouter();

const codeFilter = ref<string>('TODOS');
const searchQuery = ref<string>('');
const isModalOpen = ref(false);
const editingItem = ref<ResearchAllocationAnnex7 | null>(null);
const allocationPendingDelete = ref<ResearchAllocationAnnex7 | null>(null);
const annex7FileInputRef = ref<HTMLInputElement | null>(null);

const filteredAllocations = computed(() => {
  return store.researchAllocations.filter((item) => {
    const matchesCode = codeFilter.value === 'TODOS' || item.code === codeFilter.value;
    const query = searchQuery.value.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.teacherName.toLowerCase().includes(query) ||
      item.documentId.toLowerCase().includes(query) ||
      item.unitName.toLowerCase().includes(query) ||
      item.projectOrGroup.toLowerCase().includes(query);
    return matchesCode && matchesQuery;
  });
});

function openCreateModal(): void {
  editingItem.value = null;
  isModalOpen.value = true;
}

function openEditModal(item: ResearchAllocationAnnex7): void {
  editingItem.value = item;
  isModalOpen.value = true;
}

async function handleSaveAllocation(
  payload: Omit<ResearchAllocationAnnex7, 'id' | 'period'>,
  editingId: string | null,
): Promise<void> {
  const res = editingId
    ? await store.updateResearchAllocation(editingId, payload)
    : await store.registerResearchAllocation(payload);
  if (res.ok) {
    editingItem.value = null;
    isModalOpen.value = false;
  }
}

async function confirmRemoveAllocation(): Promise<void> {
  if (!allocationPendingDelete.value) return;
  const res = await store.removeResearchAllocation(allocationPendingDelete.value.id);
  if (res.ok) {
    allocationPendingDelete.value = null;
  }
}

function navigateToTeacherSheet(unitId: string, documentId?: string): void {
  store.selectUnit(unitId);
  router.push({
    path: '/dean/payroll',
    query: documentId ? { documentId } : undefined,
  });
}

function handleExportAnnex7Excel(): void {
  exportResearchMatrixAnnex7Xlsx(store.activePeriod, store.researchAllocations);
  store.showToast('Asignaciones de investigación descargadas');
}

async function handleImportAnnex7Excel(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const items = await importResearchMatrixAnnex7FromXlsx(file);
    if (items.length === 0) {
      store.showToast('El archivo no contiene asignaciones de investigación válidas', 'error');
      return;
    }
    let count = 0;
    for (const item of items) {
      const teacher = store.teachers.find((t) => t.documentId === item.documentId);
      // Adjunct (CATEDRA) contracts are ineligible for Annex 7 research and SICDDI hour allocations.
      if (teacher && teacher.dedication === 'CATEDRA') continue;
      const unit = teacher
        ? store.units.find((u) => u.id === teacher.unitId)
        : store.units.find(
            (u) =>
              item.unitName &&
              u.name.toLowerCase().includes(item.unitName.toLowerCase()),
          );
      const res = await store.registerResearchAllocation({
        ...item,
        unitId: unit?.id ?? teacher?.unitId ?? store.units[0]?.id ?? '',
        unitName: unit?.name ?? (item.unitName || store.units[0]?.name || ''),
      });
      if (res.ok) count++;
    }
    store.showToast(
      count === 1
        ? `1 asignación importada desde ${file.name}`
        : `${count} asignaciones importadas desde ${file.name}`,
    );
  } catch {
    store.showToast('No se pudo leer el archivo Excel seleccionado', 'error');
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div>
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          DIRECCIÓN DE INVESTIGACIÓN E INNOVACIÓN · {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Asignación de horas de investigación
        </h1>
      </div>
      <div class="page-actions">
        <input
          ref="annex7FileInputRef"
          type="file"
          accept=".xlsx,.xls,.csv"
          style="display: none"
          @change="handleImportAnnex7Excel"
        />
        <button type="button" class="btn ghost small" @click="annex7FileInputRef?.click()">
          Importar
        </button>
        <button type="button" class="btn ghost small" @click="handleExportAnnex7Excel">
          Exportar
        </button>
        <button type="button" class="btn primary small" @click="openCreateModal">
          Nueva asignación
        </button>
      </div>
    </div>

    <div class="validation-banner warning" style="margin-bottom: 14px">
      <div>
        <b>Reserva institucional (Anexo 7):</b>
        Las horas registradas aquí se reflejan automáticamente en la prenómina de cada unidad. Las asignaciones SICDDI (Acuerdo 3 de 2025: 20, 80 o 136 h/mes) no admiten edición por decanatura.
      </div>
    </div>

    <div class="card" style="padding: 16px 18px">
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
      >
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button
            v-for="item in [
              { id: 'TODOS', label: 'Todos' },
              { id: '10336', label: '10336 Proyectos' },
              { id: '10226', label: '10226 SICDDI' },
              { id: '10384', label: '10384 Coordinación' },
              { id: '10318', label: '10318 Grupo' },
            ]"
            :key="item.id"
            type="button"
            class="dia-chip"
            style="height: 28px; font-size: 11.5px"
            :class="{ active: codeFilter === item.id }"
            @click="codeFilter = item.id"
          >
            {{ item.label }}
          </button>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          class="control-sm"
          placeholder="Buscar por docente, documento, unidad o proyecto…"
          style="min-width: 250px"
        />
      </div>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Unidad</th>
            <th class="col-center">Código SAC</th>
            <th>Proyecto o grupo</th>
            <th class="col-center">Rol o nivel SICDDI</th>
            <th class="col-center">Horas/sem.</th>
            <th class="col-center">Horas/mes</th>
            <th class="col-center">Estado</th>
            <th class="col-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredAllocations.length === 0">
            <td colspan="9" class="empty-note" style="padding: 28px 16px; text-align: center">
              {{
                store.researchAllocations.length === 0
                  ? 'Aún no hay horas de investigación registradas en este periodo.'
                  : 'Ninguna asignación coincide con la búsqueda.'
              }}
            </td>
          </tr>
          <tr v-for="item in filteredAllocations" :key="item.id">
            <td data-label="Docente">
              <b
                style="color: var(--navy); cursor: pointer"
                @click="navigateToTeacherSheet(item.unitId, item.documentId)"
              >
                {{ item.teacherName }}
              </b>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-soft)">
                CC {{ item.documentId }}
              </div>
            </td>
            <td data-label="Unidad">{{ item.unitName }}</td>
            <td data-label="Código SAC" class="col-center">
              <span class="code-chip">{{ item.code }}</span>
              <div style="font-size: 10.5px; color: var(--ink-soft); margin-top: 2px">
                {{ item.activityName }}
              </div>
            </td>
            <td data-label="Proyecto o grupo">
              <b>{{ item.projectOrGroup }}</b>
              <div v-if="item.notes" style="font-size: 10.5px; color: var(--blue)">
                {{ item.notes }}
              </div>
            </td>
            <td data-label="Rol o nivel" class="col-center">
              <span v-if="item.sicddiLevel" class="badge aprobado">{{ item.sicddiLevel }}</span>
              <span v-else class="badge inscrito">{{ item.role }}</span>
            </td>
            <td data-label="Horas/sem." class="col-center" style="font-family: var(--font-mono); white-space: nowrap">
              {{ item.weeklyHours }} h
            </td>
            <td data-label="Horas/mes" class="col-center" style="white-space: nowrap">
              <b style="font-family: var(--font-mono); font-size: 13.5px; color: var(--navy)">
                {{ item.monthlyHours }} h/mes
              </b>
            </td>
            <td data-label="Estado" class="col-center">
              <span v-if="item.isSicddiLocked" class="badge reprobado" style="white-space: nowrap">
                Fijo por Acuerdo 3
              </span>
              <span v-else class="badge aprobado" style="white-space: nowrap">
                Asignado en unidad
              </span>
            </td>
            <td class="col-right" style="white-space: nowrap">
              <div style="display: inline-flex; align-items: center; gap: 5px; justify-content: flex-end">
                <button type="button" class="btn ghost small" @click="openEditModal(item)">
                  Editar
                </button>
                <button type="button" class="btn ghost small" @click="navigateToTeacherSheet(item.unitId)">
                  Prenómina
                </button>
                <button
                  type="button"
                  class="btn danger icon small"
                  style="font-size: 15px; line-height: 1"
                  title="Eliminar asignación"
                  @click="allocationPendingDelete = item"
                >
                  ×
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ResearchAllocationModal
      :open="isModalOpen"
      :editing-item="editingItem"
      @close="isModalOpen = false"
      @save="handleSaveAllocation"
    />

    <UstaModal
      :open="!!allocationPendingDelete"
      title="Eliminar asignación de investigación"
      subtitle="Las horas se retirarán también de la prenómina del docente."
      @close="allocationPendingDelete = null"
    >
      <p v-if="allocationPendingDelete" class="sub" style="margin: 0">
        ¿Eliminar la asignación del código <b>{{ allocationPendingDelete.code }}</b> ({{ allocationPendingDelete.monthlyHours }} h/mes) de <b>{{ allocationPendingDelete.teacherName }}</b>?
      </p>
      <template #actions>
        <button type="button" class="btn ghost" @click="allocationPendingDelete = null">
          Cancelar
        </button>
        <button type="button" class="btn danger" @click="confirmRemoveAllocation">
          Eliminar asignación
        </button>
      </template>
    </UstaModal>
  </div>
</template>
