<script setup lang="ts">
/**
 * Executive review inbox listing academic unit pre-payrolls with Annex 5/6 quota compliance
 * indicators, alert counts, and status filters.
 */
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

const statusOptions: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'En Revisión', label: 'En revisión' },
  { value: 'Enviada', label: 'Enviada' },
  { value: 'Devuelta con Observaciones', label: 'Devuelta' },
  { value: 'Borrador', label: 'Borrador' },
  { value: 'Avalada', label: 'Avalada' },
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
    case 'Borrador':
      return 'retirado';
    default:
      return 'pendiente';
  }
}

function getStatusLabel(status: PayrollStatus): string {
  return status === 'Devuelta con Observaciones' ? 'Devuelta' : status;
}

function getBagTextColor(unit: AcademicUnitSummary, code: string, cap: number): string {
  const allocated = store.sumCodeInUnit(unit.id, code);
  if (allocated > cap) return 'var(--danger)';
  if (allocated === cap) return 'var(--success)';
  if (unit.payrollStatus === 'Borrador' && allocated === 0 && store.isUnitUnstarted(unit.id)) {
    return 'var(--ink-soft)';
  }
  return 'var(--warning)';
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
          :key="statusOption.value"
          class="dia-chip"
          style="height: 28px; font-size: 11.5px"
          :class="{ active: statusFilter === statusOption.value }"
          @click="statusFilter = statusOption.value"
        >
          {{ statusOption.label }}
        </button>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <select v-model="divisionFilter" class="control-sm">
          <option v-for="div in uniqueDivisions" :key="div" :value="div">
            {{ div === 'TODAS' ? 'Todas las divisiones' : div }}
          </option>
        </select>

        <input
          v-model="searchQuery"
          type="text"
          class="control-sm"
          placeholder="Buscar unidad o decanatura…"
          style="min-width: 210px"
        />
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Unidad académica</th>
          <th class="col-center">Estado</th>
          <th class="col-center">30411 Calidad</th>
          <th class="col-center">40106 Currículo</th>
          <th class="col-center">SEA / Saber Pro</th>
          <th class="col-center">20502 Graduados</th>
          <th class="col-center">Validación</th>
          <th class="col-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredUnits.length === 0">
          <td colspan="8" class="empty-note" style="padding: 24px 16px; text-align: center">
            Sin unidades para los filtros seleccionados.
          </td>
        </tr>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td data-label="Unidad">
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
          <td data-label="Estado" class="col-center">
            <span class="badge" :class="getStatusBadgeClass(unit.payrollStatus)">
              {{ getStatusLabel(unit.payrollStatus) }}
            </span>
            <div
              style="font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-faint); margin-top: 2px"
            >
              v{{ unit.currentVersion }} · {{ unit.updatedAt }}
            </div>
          </td>
          <td data-label="30411 Calidad" class="col-center" style="white-space: nowrap">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{ color: getBagTextColor(unit, '30411', unit.qualityCap30411) }"
            >
              {{ store.sumCodeInUnit(unit.id, '30411') }} / {{ unit.qualityCap30411 }} h
            </span>
          </td>
          <td data-label="40106 Currículo" class="col-center" style="white-space: nowrap">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{ color: getBagTextColor(unit, '40106', unit.curriculumCap40106) }"
            >
              {{ store.sumCodeInUnit(unit.id, '40106') }} / {{ unit.curriculumCap40106 }} h
            </span>
          </td>
          <td data-label="SEA / Saber Pro" class="col-center" style="white-space: nowrap">
            <span
              style="font-family: var(--font-mono); font-size: 11.5px"
              :style="{
                color:
                  unit.payrollStatus === 'Borrador' && store.isUnitUnstarted(unit.id)
                    ? 'var(--ink-soft)'
                    : 'var(--ink)',
              }"
            >
              SEA: {{ store.sumCodeInUnit(unit.id, '40109') }}/{{ unit.seaCap40109 }}h · SP:
              {{ store.sumCodeInUnit(unit.id, '40127') }}/{{ unit.saberProCap40127 }}h
            </span>
          </td>
          <td data-label="20502 Graduados" class="col-center" style="white-space: nowrap">
            <span
              style="font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              :style="{ color: getBagTextColor(unit, '20502', unit.graduatesCap20502) }"
            >
              {{ store.sumCodeInUnit(unit.id, '20502') }} / {{ unit.graduatesCap20502 }} h
            </span>
          </td>
          <td data-label="Validación" class="col-center">
            <div style="display: inline-flex; gap: 5px; flex-wrap: wrap; justify-content: center">
              <span
                v-if="store.countActiveUnitAlerts(unit.id) > 0"
                class="badge reprobado"
                style="padding: 3px 7px"
              >
                {{ store.countActiveUnitAlerts(unit.id) }}
                {{ store.countActiveUnitAlerts(unit.id) === 1 ? 'alerta' : 'alertas' }}
              </span>
              <span
                v-else-if="unit.payrollStatus === 'Borrador' && store.isUnitUnstarted(unit.id)"
                class="badge retirado"
                style="padding: 3px 7px"
              >
                Sin horas
              </span>
              <span v-else class="badge aprobado" style="padding: 3px 7px">Sin alertas</span>
              <span
                v-if="store.countPendingApprovals(unit.id) > 0"
                class="badge pendiente"
                style="padding: 3px 7px"
              >
                {{ store.countPendingApprovals(unit.id) }} aval V.A.
              </span>
            </div>
          </td>
          <td data-label="Acciones" class="col-right" style="white-space: nowrap">
            <div style="display: flex; gap: 5px; justify-content: flex-end">
              <button type="button" class="btn primary small" @click="emit('openReview', unit, false)">
                Abrir ({{ store.countUnitTeachers(unit.id) }})
              </button>
              <button
                v-if="unit.currentVersion > 1"
                type="button"
                class="btn accent small"
                title="Comparar contra la primera entrega"
                @click="emit('openReview', unit, true)"
              >
                Comparar v1
              </button>
              <button
                v-if="unit.payrollStatus !== 'Avalada'"
                type="button"
                class="btn ghost small"
                @click="
                  store.changePayrollStatus(
                    unit.id,
                    'Avalada',
                    store.activeRole === 'vice_rector'
                      ? 'Prenómina avalada por Vicerrectoría Académica'
                      : 'Prenómina avalada por Dirección de Enseñanza y Aprendizaje',
                  )
                "
              >
                Avalar
              </button>
              <button
                v-if="unit.payrollStatus !== 'Devuelta con Observaciones'"
                type="button"
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
