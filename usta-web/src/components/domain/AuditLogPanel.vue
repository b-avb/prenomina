<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';

const store = usePayrollStore();
const searchQuery = ref<string>('');

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
          Bitácora de Auditoría, Ajustes de Revisión y Avales (RF-24, RF-37)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Reemplaza las celdas pintadas en rojo/amarillo y las hojas duplicadas dejando trazabilidad exacta de cada ajuste.
        </p>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Filtrar por facultad, docente o autor…"
        style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 240px"
      />
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Autor y Rol</th>
          <th>Facultad / Docente</th>
          <th>Acción Realizada</th>
          <th>Cambio (Anterior → Nuevo)</th>
          <th>Justificación / Observación</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in filteredAuditLogs" :key="entry.id">
          <td data-label="Fecha" style="font-family: var(--font-mono); font-size: 11px">
            {{ entry.timestamp }}
          </td>
          <td data-label="Autor">
            <b>{{ entry.user }}</b>
            <div style="font-size: 10.5px; color: var(--ink-faint)">{{ entry.role }}</div>
          </td>
          <td data-label="Facultad / Docente">
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
          <td data-label="Justificación" style="font-size: 11.5px; color: var(--ink-soft)">
            {{ entry.reason }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
