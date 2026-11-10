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
          Topes Semestrales por Facultad y Dirección Académica (ANEXO 5 + ANEXO 6)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Cualquier ajuste aquí actualiza inmediatamente las validaciones y barras de progreso en la prenómina de la facultad.
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <input
          v-model="facultySearchQuery"
          type="text"
          placeholder="Buscar unidad académica…"
          style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 220px"
        />
        <button class="btn primary small" @click="emit('newUnit')">
          + Nueva Unidad Académica
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Facultad / Unidad Académica</th>
          <th>Decano(a) / Director(a)</th>
          <th>Posgrado</th>
          <th>30411 Calidad</th>
          <th>40106 Currículo</th>
          <th>40109 Docente SEA</th>
          <th>40127 Saber Pro</th>
          <th>20502 Graduados (ANEXO 6)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in filteredUnits" :key="unit.id">
          <td data-label="Facultad">
            <b style="color: var(--navy)">{{ unit.name }}</b>
            <div style="font-size: 10.5px; color: var(--ink-soft)">{{ unit.division }}</div>
          </td>
          <td data-label="Decano(a)">
            <input
              :value="unit.deanName"
              type="text"
              style="width: 195px; padding: 4px 7px; border: 1px solid var(--border); border-radius: 6px; font-size: 11.5px"
              @change="store.updateUnitDean({ unitId: unit.id, deanName: eventValue($event) })"
            />
          </td>
          <td data-label="Posgrado">
            <label class="toggle">
              <input
                :checked="unit.hasPostgraduates"
                type="checkbox"
                @change="store.updateUnit(unit.id, { hasPostgraduates: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
            </label>
          </td>
          <td data-label="Calidad (30411)">
            <input
              :value="unit.qualityCap30411"
              type="number"
              min="0"
              max="200"
              step="4"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { qualityCap30411: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 4px">h</span>
          </td>
          <td data-label="Currículo (40106)">
            <input
              :value="unit.curriculumCap40106"
              type="number"
              min="0"
              max="200"
              step="4"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { curriculumCap40106: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 4px">h</span>
          </td>
          <td data-label="SEA (40109)">
            <input
              :value="unit.seaCap40109"
              type="number"
              min="0"
              max="100"
              step="4"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { seaCap40109: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 4px">h</span>
          </td>
          <td data-label="Saber Pro (40127)">
            <input
              :value="unit.saberProCap40127"
              type="number"
              min="0"
              max="100"
              step="4"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { saberProCap40127: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 4px">h</span>
          </td>
          <td data-label="Graduados (20502)">
            <input
              :value="unit.graduatesCap20502"
              type="number"
              min="0"
              max="64"
              step="4"
              style="width: 68px; padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateUnit(unit.id, { graduatesCap20502: eventNumber($event) })"
            />
            <span style="font-size: 11px; margin-left: 4px">h</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
