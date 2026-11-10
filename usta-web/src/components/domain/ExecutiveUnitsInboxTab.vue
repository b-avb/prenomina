<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AcademicUnitSummary, PayrollStatus } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';

const emit = defineEmits<{
  openReview: [unit: AcademicUnitSummary, compareVersion1: boolean];
  returnUnit: [unit: AcademicUnitSummary];
}>();

const store = usePayrollStore();

const statusFilter = ref<string>('TODOS');
const divisionFilter = ref<string>('TODAS');
const searchQuery = ref<string>('');

const statusOptions = [
  'TODOS',
  'En Revisión',
  'Enviada',
  'Devuelta con Observaciones',
  'Borrador',
  'Avalada',
];

const uniqueDivisions = computed(() => {
  const set = new Set(store.units.map((u) => u.division));
  return ['TODAS', ...Array.from(set)];
});

const filteredUnits = computed(() =>
  store.units.filter((unit) => {
    const matchesStatus =
      statusFilter.value === 'TODOS' || unit.payrollStatus === statusFilter.value;
    const matchesDivision =
      divisionFilter.value === 'TODAS' || unit.division === divisionFilter.value;
    const query = searchQuery.value.trim().toLowerCase();
    const matchesText =
      !query ||
      unit.name.toLowerCase().includes(query) ||
      unit.division.toLowerCase().includes(query) ||
      unit.deanName.toLowerCase().includes(query);
    return matchesStatus && matchesDivision && matchesText;
  }),
);

function getStatusBadgeClass(status: PayrollStatus): string {
  switch (status) {
    case 'Avalada':
      return 'aprobado';
    case 'En Revisión':
    case 'Enviada':
      return 'inscrito';
    case 'Devuelta con Observaciones':
      return 'reprobado';
    default:
      return 'pendiente';
  }
}
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div style="display: flex; gap: 6px; flex-wrap: wrap">
        <button
          v-for="statusOption in statusOptions"
          :key="statusOption"
          class="dia-chip"
          style="height: 28px; font-size: 11.5px"
          :class="{ active: statusFilter === statusOption }"
          @click="statusFilter = statusOption"
        >
          {{ statusOption }}
        </button>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <select
          v-model="divisionFilter"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; color: var(--navy); font-weight: 600"
        >
          <option v-for="div in uniqueDivisions" :key="div" :value="div">
            {{ div === 'TODAS' ? 'Todas las Divisiones' : div }}
          </option>
        </select>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar facultad o decano…"
          style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 210px"
        />
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Facultad / Unidad Académica</th>
          <th>Estado y Versión</th>
          <th>30411 Calidad</th>
          <th>40106 Currículo</th>
          <th>SEA / Saber Pro</th>
          <th>20502 Graduados</th>
          <th>Validación en Vivo</th>
          <th style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td data-label="Facultad">
            <b
              style="color: var(--navy); font-size: 13px; cursor: pointer"
              @click="emit('openReview', unit, false)"
            >
              {{ unit.name }}
            </b>
            <div style="font-size: 11px; color: var(--ink-soft)">
              {{ unit.division }} · {{ unit.deanName }}
            </div>
          </td>
          <td data-label="Estado">
            <span class="badge" :class="getStatusBadgeClass(unit.payrollStatus)">
              {{ unit.payrollStatus }}
            </span>
            <div
              style="font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-faint); margin-top: 2px"
            >
              v{{ unit.currentVersion }} · {{ unit.updatedAt }}
            </div>
          </td>
          <td data-label="30411 Calidad">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{
                color:
                  store.sumCodeInUnit(unit.id, '30411') === unit.qualityCap30411
                    ? 'var(--success)'
                    : 'var(--warning)',
              }"
            >
              {{ store.sumCodeInUnit(unit.id, '30411') }} / {{ unit.qualityCap30411 }} h
            </span>
          </td>
          <td data-label="40106 Currículo">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{
                color:
                  store.sumCodeInUnit(unit.id, '40106') === unit.curriculumCap40106
                    ? 'var(--success)'
                    : 'var(--warning)',
              }"
            >
              {{ store.sumCodeInUnit(unit.id, '40106') }} / {{ unit.curriculumCap40106 }} h
            </span>
          </td>
          <td data-label="SEA / Saber Pro">
            <span style="font-family: var(--font-mono); font-size: 11.5px">
              SEA: {{ store.sumCodeInUnit(unit.id, '40109') }}/{{ unit.seaCap40109 }}h · SP:
              {{ store.sumCodeInUnit(unit.id, '40127') }}/{{ unit.saberProCap40127 }}h
            </span>
          </td>
          <td data-label="20502 Graduados">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{
                color:
                  store.sumCodeInUnit(unit.id, '20502') === unit.graduatesCap20502
                    ? 'var(--success)'
                    : 'var(--warning)',
              }"
            >
              {{ store.sumCodeInUnit(unit.id, '20502') }} / {{ unit.graduatesCap20502 }} h
            </span>
          </td>
          <td data-label="Alertas">
            <div style="display: flex; gap: 5px; flex-wrap: wrap">
              <span
                v-if="store.countActiveUnitAlerts(unit.id) > 0"
                class="badge reprobado"
                style="padding: 3px 7px"
              >
                {{ store.countActiveUnitAlerts(unit.id) }} alerta(s)
              </span>
              <span v-else class="badge aprobado" style="padding: 3px 7px">✓ Sin alertas</span>
              <span
                v-if="store.countPendingApprovals(unit.id) > 0"
                class="badge pendiente"
                style="padding: 3px 7px"
              >
                {{ store.countPendingApprovals(unit.id) }} aval V.A.
              </span>
            </div>
          </td>
          <td data-label="Acciones" style="text-align: right; white-space: nowrap">
            <div style="display: flex; gap: 5px; justify-content: flex-end">
              <button class="btn primary small" @click="emit('openReview', unit, false)">
                Abrir ({{ store.countUnitTeachers(unit.id) }} doc.)
              </button>
              <button
                v-if="unit.currentVersion > 1"
                class="btn accent small"
                title="Ver diferencias entre la primera entrega v1 y la versión revisada"
                @click="emit('openReview', unit, true)"
              >
                v1→v{{ unit.currentVersion }}
              </button>
              <button
                v-if="unit.payrollStatus !== 'Avalada'"
                class="btn ghost small"
                @click="
                  store.changePayrollStatus(
                    unit.id,
                    'Avalada',
                    'Prenómina avalada por Dirección de Enseñanza y Aprendizaje',
                  )
                "
              >
                Avalar
              </button>
              <button
                v-if="unit.payrollStatus !== 'Devuelta con Observaciones'"
                class="btn danger small"
                @click="emit('returnUnit', unit)"
              >
                Devolver
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
