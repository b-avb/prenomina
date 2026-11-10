<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
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

function handleSaveAllocation(
  payload: Omit<ResearchAllocationAnnex7, 'id' | 'period'>,
  editingId: string | null,
): void {
  if (editingId) {
    store.updateResearchAllocation(editingId, payload);
  } else {
    store.registerResearchAllocation(payload);
  }
  editingItem.value = null;
  isModalOpen.value = false;
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
  store.showToast('Matriz Oficial ANEXO 7 exportada en Excel (.xlsx)');
}

async function handleImportAnnex7Excel(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const items = await importResearchMatrixAnnex7FromXlsx(file);
    let count = 0;
    items.forEach((item) => {
      const teacher = store.teachers.find((t) => t.documentId === item.documentId);
      const unit = teacher
        ? store.units.find((u) => u.id === teacher.unitId)
        : store.units.find((u) =>
            u.name.toLowerCase().includes(item.unitName.toLowerCase()),
          );
      store.registerResearchAllocation({
        ...item,
        unitId: unit?.id ?? teacher?.unitId ?? store.units[0]?.id ?? '',
        unitName: unit?.name ?? (item.unitName || store.units[0]?.name || ''),
      });
      count++;
    });
    store.showToast(`Se importaron y precargaron ${count} asignaciones desde ${file.name}`);
  } catch {
    store.showToast('No se pudo procesar el archivo Excel de ANEXO 7', 'error');
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
          DIRECCIÓN DE INVESTIGACIÓN E INNOVACIÓN · REEMPLAZO DEL PDF ANEXO 7 (RF-29, RF-30, RF-31)
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Precarga Automática de Horas de Investigación por Cédula (ANEXO 7)
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
        <button class="btn ghost small" @click="annex7FileInputRef?.click()">
          ↑ Importar ANEXO 7 (.xlsx)
        </button>
        <button class="btn ghost small" @click="handleExportAnnex7Excel">
          ↓ Exportar ANEXO 7 (.xlsx)
        </button>
        <button class="btn primary small" @click="openCreateModal">
          + Registrar Asignación por Cédula
        </button>
      </div>
    </div>

    <div class="validation-banner warning" style="margin-bottom: 14px">
      <div>
        <b>🔒 Información Estrictamente Confidencial (RF-31 · ANEXO 7):</b>
        Las horas registradas aquí por cédula se precargan automáticamente en la prenómina de la facultad correspondiente. Las horas de <b>SICDDI (Acuerdo 3 del 19/03/2025)</b> son fijas por nivel (20 h, 80 h o 136 h/mes) y quedan bloqueadas contra edición del decano.
      </div>
    </div>

    <div class="card" style="padding: 16px 18px">
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
      >
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button
            v-for="item in [
              { id: 'TODOS', label: 'Todos los Códigos' },
              { id: '10336', label: '10336 Proyectos' },
              { id: '10226', label: '10226 SICDDI' },
              { id: '10384', label: '10384 Coordinador' },
              { id: '10318', label: '10318 Líder Grupo' },
            ]"
            :key="item.id"
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
          placeholder="Buscar por docente, cédula, facultad o proyecto…"
          style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 250px"
        />
      </div>

      <table class="compact-table">
        <thead>
          <tr>
            <th>Cédula y Docente</th>
            <th>Facultad</th>
            <th>Código SAC</th>
            <th>Proyecto / Grupo / Centro</th>
            <th>Rol / Subnivel SICDDI</th>
            <th>Horas Sem.</th>
            <th>Horas Mes</th>
            <th>Estado en Prenómina</th>
            <th style="text-align: right">Acciones</th>
          </tr>
        </thead>
        <tbody>
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
            <td data-label="Facultad">{{ item.unitName }}</td>
            <td data-label="Código SAC">
              <span class="code-chip">{{ item.code }}</span>
              <div style="font-size: 10.5px; color: var(--ink-soft); margin-top: 2px">
                {{ item.activityName }}
              </div>
            </td>
            <td data-label="Proyecto / Grupo">
              <b>{{ item.projectOrGroup }}</b>
              <div v-if="item.notes" style="font-size: 10.5px; color: var(--blue)">
                {{ item.notes }}
              </div>
            </td>
            <td data-label="Rol / Nivel">
              <span v-if="item.sicddiLevel" class="badge aprobado">{{ item.sicddiLevel }}</span>
              <span v-else class="badge inscrito">{{ item.role }}</span>
            </td>
            <td data-label="Horas Sem." style="font-family: var(--font-mono)">
              {{ item.weeklyHours }} h
            </td>
            <td data-label="Horas Mes">
              <b style="font-family: var(--font-mono); font-size: 14px; color: var(--navy)">
                {{ item.monthlyHours }} h/mes
              </b>
            </td>
            <td data-label="Estado">
              <span v-if="item.isSicddiLocked" class="badge reprobado">
                Fijo Acuerdo 3 (Bloqueado)
              </span>
              <span v-else class="badge aprobado">Precargado en Facultad</span>
            </td>
            <td style="text-align: right; white-space: nowrap">
              <div style="display: flex; gap: 5px; justify-content: flex-end">
                <button class="btn ghost small" @click="openEditModal(item)">
                  Editar
                </button>
                <button class="btn ghost small" @click="navigateToTeacherSheet(item.unitId)">
                  Ver en Prenómina
                </button>
                <button
                  class="btn danger small"
                  title="Eliminar asignación"
                  @click="store.removeResearchAllocation(item.id)"
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
  </div>
</template>
