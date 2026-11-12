<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';

const store = usePayrollStore();
const searchQuery = ref<string>('');

const ROLE_LABELS: Record<string, string> = {
  director: 'Dirección de Enseñanza y Aprendizaje',
  dean: 'Decanatura',
  vice_rector: 'Vicerrectoría Académica',
  research: 'Dirección de Investigación',
};

function formatAuditRole(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

const filteredAuditLogs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return store.auditLogs;
  return store.auditLogs.filter(
    (entry) =>
      entry.unitName.toLowerCase().includes(query) ||
      (entry.teacherName && entry.teacherName.toLowerCase().includes(query)) ||
      entry.action.toLowerCase().includes(query) ||
      entry.user.toLowerCase().includes(query),
  );
});
</script>

<template>
  <div class="card">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Bitácora de auditoría
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Cambios de estado, asignaciones, ajustes de revisión y avales del periodo.
        </p>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        class="control-sm"
        placeholder="Filtrar por unidad, docente o autor…"
        style="min-width: 240px"
      />
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Autor</th>
          <th>Unidad / Docente</th>
          <th>Acción</th>
          <th>Cambio</th>
          <th>Observación</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredAuditLogs.length === 0">
          <td colspan="6" class="empty-note" style="padding: 28px 16px; text-align: center">
            {{
              store.auditLogs.length === 0
                ? 'Sin movimientos registrados en este periodo.'
                : 'Sin registros para el filtro seleccionado.'
            }}
          </td>
        </tr>
        <tr v-for="entry in filteredAuditLogs" :key="entry.id">
          <td data-label="Fecha" style="font-family: var(--font-mono); font-size: 11px">
            {{ entry.timestamp }}
          </td>
          <td data-label="Autor">
            <b>{{ entry.user }}</b>
            <div style="font-size: 10.5px; color: var(--ink-faint)">
              {{ formatAuditRole(entry.role) }}
            </div>
          </td>
          <td data-label="Unidad / Docente">
            <b>{{ entry.unitName }}</b>
            <div v-if="entry.teacherName" style="font-size: 11px; color: var(--blue)">
              {{ entry.teacherName }}
            </div>
          </td>
          <td data-label="Acción">{{ entry.action }}</td>
          <td data-label="Cambio">
            <span class="diff-pill">
              <del v-if="entry.previousValue">{{ entry.previousValue }}</del>
              <span>→</span>
              <ins>{{ entry.newValue }}</ins>
            </span>
          </td>
          <td data-label="Observación" style="font-size: 11.5px; color: var(--ink-soft)">
            {{ entry.reason }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
