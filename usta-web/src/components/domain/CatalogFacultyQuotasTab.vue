<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber, eventValue } from '@/utils/dom-events';

const emit = defineEmits<{
  newUnit: [];
}>();

const store = usePayrollStore();
const facultySearchQuery = ref<string>('');

const filteredUnits = computed(() => {
  const query = facultySearchQuery.value.trim().toLowerCase();
  if (!query) return store.units;
  return store.units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(query) ||
      unit.division.toLowerCase().includes(query),
  );
});
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Topes semestrales por unidad académica (Anexos 5 y 6)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Los ajustes actualizan los cupos disponibles en la prenómina de cada unidad.
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <input
          v-model="facultySearchQuery"
          type="text"
          class="control-sm"
          placeholder="Buscar unidad académica…"
          style="min-width: 220px"
        />
        <button type="button" class="btn primary small" style="height: 34px" @click="emit('newUnit')">
          Nueva unidad
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Unidad académica</th>
          <th>Titular</th>
          <th class="col-center">Posgrado</th>
          <th class="col-center">30411 Calidad</th>
          <th class="col-center">40106 Currículo</th>
          <th class="col-center">40109 SEA</th>
          <th class="col-center">40127 Saber Pro</th>
          <th class="col-center">20502 Graduados</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredUnits.length === 0">
          <td colspan="8" class="empty-note" style="padding: 24px 16px; text-align: center">
            Sin unidades académicas para el filtro seleccionado.
          </td>
        </tr>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td data-label="Unidad">
            <b style="color: var(--navy)">{{ unit.name }}</b>
            <div style="font-size: 10.5px; color: var(--ink-soft)">{{ unit.division }}</div>
          </td>
          <td data-label="Titular">
            <input
              :value="unit.deanName"
              type="text"
              class="table-input"
              style="width: 100%; min-width: 170px; max-width: 230px"
              @change="store.updateUnitDean({ unitId: unit.id, deanName: eventValue($event) })"
            />
          </td>
          <td data-label="Posgrado" class="col-center">
            <label class="toggle">
              <input
                :checked="unit.hasPostgraduates"
                type="checkbox"
                @change="store.updateUnit(unit.id, { hasPostgraduates: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
            </label>
          </td>
          <td data-label="Calidad (30411)" class="col-center" style="white-space: nowrap">
            <input
              :value="unit.qualityCap30411"
              type="number"
              min="0"
              max="200"
              step="4"
              class="table-input table-input--num"
              style="width: 54px"
              @change="store.updateUnit(unit.id, { qualityCap30411: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 3px; color: var(--ink-soft)">h</span>
          </td>
          <td data-label="Currículo (40106)" class="col-center" style="white-space: nowrap">
            <input
              :value="unit.curriculumCap40106"
              type="number"
              min="0"
              max="200"
              step="4"
              class="table-input table-input--num"
              style="width: 54px"
              @change="store.updateUnit(unit.id, { curriculumCap40106: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 3px; color: var(--ink-soft)">h</span>
          </td>
          <td data-label="SEA (40109)" class="col-center" style="white-space: nowrap">
            <input
              :value="unit.seaCap40109"
              type="number"
              min="0"
              max="100"
              step="4"
              class="table-input table-input--num"
              style="width: 54px"
              @change="store.updateUnit(unit.id, { seaCap40109: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 3px; color: var(--ink-soft)">h</span>
          </td>
          <td data-label="Saber Pro (40127)" class="col-center" style="white-space: nowrap">
            <input
              :value="unit.saberProCap40127"
              type="number"
              min="0"
              max="100"
              step="4"
              class="table-input table-input--num"
              style="width: 54px"
              @change="store.updateUnit(unit.id, { saberProCap40127: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 3px; color: var(--ink-soft)">h</span>
          </td>
          <td data-label="Graduados (20502)" class="col-center" style="white-space: nowrap">
            <input
              :value="unit.graduatesCap20502"
              type="number"
              min="0"
              max="64"
              step="4"
              class="table-input table-input--num"
              style="width: 54px"
              @change="store.updateUnit(unit.id, { graduatesCap20502: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 3px; color: var(--ink-soft)">h</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
