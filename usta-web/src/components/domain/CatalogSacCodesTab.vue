<script setup lang="ts">
/**
 * Annex 4 SAC activity catalog table supporting substantive-function filtering, inline
 * base/cap/severity edits, and modal configuration launch.
 */
import { computed, ref } from 'vue';
import type { RuleSeverity, SacCode } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNullableNumber, eventValue } from '@/utils/dom-events';

const emit = defineEmits<{
  editCode: [codeItem: SacCode];
}>();

const store = usePayrollStore();

const functionFilter = ref<string>('TODAS');
const codeSearchQuery = ref<string>('');

const filterOptions = [
  'TODAS',
  'Enseñanza-Aprendizaje',
  'Proyección Social',
  'Investigación',
  'Gestión Académica',
];

const filteredCodes = computed(() =>
  store.sacCodes.filter((codeItem) => {
    const matchesFn =
      functionFilter.value === 'TODAS' ||
      codeItem.substantiveFunction === functionFilter.value;
    const query = codeSearchQuery.value.trim().toLowerCase();
    const matchesQuery =
      !query ||
      codeItem.code.toLowerCase().includes(query) ||
      codeItem.name.toLowerCase().includes(query) ||
      codeItem.definition.toLowerCase().includes(query);
    return matchesFn && matchesQuery;
  }),
);
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div style="display: flex; gap: 6px; flex-wrap: wrap">
        <button
          v-for="fn in filterOptions"
          :key="fn"
          type="button"
          class="dia-chip"
          style="height: 28px; font-size: 11.5px"
          :class="{ active: functionFilter === fn }"
          @click="functionFilter = fn"
        >
          {{ fn === 'TODAS' ? 'Todas' : fn }}
        </button>
      </div>
      <input
        v-model="codeSearchQuery"
        type="text"
        class="control-sm"
        placeholder="Buscar por código (ej. 40106) o actividad…"
        style="min-width: 250px"
      />
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th class="col-center">Código</th>
          <th class="col-center">Función sustantiva</th>
          <th>Actividad y lineamiento (Anexo 4)</th>
          <th class="col-center">Base</th>
          <th class="col-center">Tope</th>
          <th class="col-center">Aval V.A.</th>
          <th class="col-center">Control del tope</th>
          <th class="col-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredCodes.length === 0">
          <td colspan="8" class="empty-note" style="padding: 24px 16px; text-align: center">
            Sin códigos SAC para el filtro seleccionado.
          </td>
        </tr>
        <tr v-for="codeItem in filteredCodes" :key="codeItem.code">
          <td data-label="Código" class="col-center">
            <span class="code-chip">{{ codeItem.code }}</span>
          </td>
          <td data-label="Función" class="col-center">
            <span class="badge inscrito" style="white-space: nowrap">
              {{ codeItem.substantiveFunction }}
            </span>
          </td>
          <td data-label="Actividad">
            <b style="color: var(--navy); font-size: 12px">
              {{ codeItem.name.replace('TUNJA ', '') }}
            </b>
            <div style="font-size: 11px; color: var(--ink-soft); margin-top: 2px">
              {{ codeItem.guideline }}
            </div>
            <div
              v-if="
                (codeItem.facultyRules && codeItem.facultyRules.length > 0) ||
                codeItem.mandatoryInFaculty ||
                codeItem.lockedByResearch ||
                codeItem.hoursPerUnitFactor
              "
              style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 4px"
            >
              <span
                v-if="codeItem.mandatoryInFaculty"
                class="badge inscrito"
                style="font-size: 10px"
              >
                Obligatorio en unidad
              </span>
              <span
                v-if="codeItem.lockedByResearch"
                class="badge observado"
                style="font-size: 10px"
              >
                Anexo 7 · Investigación
              </span>
              <span
                v-if="codeItem.hoursPerUnitFactor"
                class="badge inscrito"
                style="font-size: 10px"
              >
                {{ codeItem.hoursPerUnitFactor }}h / {{ codeItem.unitLabel || 'unidad' }}
              </span>
              <span
                v-for="rf in codeItem.facultyRules"
                :key="rf.unitId"
                class="badge aprobado"
                style="font-size: 10px"
              >
                {{ rf.unitName }}: {{ rf.minTeacherHours ?? 0 }}–{{
                  rf.maxTeacherHours ?? '∞'
                }}h
                <template v-if="rf.facultyBagCap">
                  (Bolsa: {{ rf.facultyBagCap }}h)
                </template>
              </span>
            </div>
          </td>
          <td data-label="Base" class="col-center">
            <span
              v-if="codeItem.code === '40108'"
              style="font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-faint)"
            >
              {{ codeItem.psePercentage ?? 25 }}%
            </span>
            <input
              v-else
              :value="codeItem.baseHours ?? ''"
              type="number"
              min="0"
              max="240"
              placeholder="—"
              title="Horas mínimas base (dejar vacío si no aplica mínimo fijo)"
              class="table-input table-input--num"
              style="width: 54px"
              @change="
                store.updateSacCode(codeItem.code, {
                  baseHours: eventNullableNumber($event),
                })
              "
            />
          </td>
          <td data-label="Tope" class="col-center">
            <span
              v-if="codeItem.code === '40108'"
              style="font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-faint)"
            >
              Auto {{ codeItem.psePercentage ?? 25 }}%
            </span>
            <input
              v-else
              :value="codeItem.capHours ?? ''"
              type="number"
              min="0"
              max="240"
              placeholder="Aval"
              title="Tope máximo mensual (dejar vacío cuando el tope dependa del aval o resolución)"
              class="table-input table-input--num"
              style="width: 54px"
              @change="
                store.updateSacCode(codeItem.code, {
                  capHours: eventNullableNumber($event),
                })
              "
            />
            <div
              v-if="codeItem.postgraduateCapHours"
              style="font-size: 10px; color: var(--blue); font-weight: 700; margin-top: 2px"
            >
              Posgrado: {{ codeItem.postgraduateCapHours }}h
            </div>
          </td>
          <td data-label="Aval V.A." class="col-center">
            <label class="toggle">
              <input
                :checked="codeItem.requiresViceRectorApproval"
                type="checkbox"
                @change="
                  store.updateSacCode(codeItem.code, {
                    requiresViceRectorApproval: eventChecked($event),
                  })
                "
              />
              <span class="toggle__track"></span>
              <span style="font-size: 11px; font-weight: 700; white-space: nowrap">
                {{ codeItem.requiresViceRectorApproval ? 'Anexo 3' : 'No' }}
              </span>
            </label>
          </td>
          <td data-label="Control del tope" class="col-center">
            <select
              :value="codeItem.severity"
              class="table-select"
              @change="
                store.updateSacCode(codeItem.code, {
                  severity: eventValue($event) as RuleSeverity,
                })
              "
            >
              <option value="blocking">Bloqueante</option>
              <option value="justifiable_alert">Alerta justificable</option>
              <option value="informative">Informativa</option>
            </select>
          </td>
          <td data-label="Acciones" class="col-right">
            <button type="button" class="btn ghost small" @click="emit('editCode', codeItem)">
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
