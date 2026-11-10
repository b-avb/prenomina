<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RuleSeverity, SacCode } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber, eventValue } from '@/utils/dom-events';

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
          class="dia-chip"
          style="height: 28px; font-size: 11.5px"
          :class="{ active: functionFilter === fn }"
          @click="functionFilter = fn"
        >
          {{ fn }}
        </button>
      </div>
      <input
        v-model="codeSearchQuery"
        type="text"
        placeholder="Buscar por código (ej. 40106) o actividad…"
        style="padding: 6px 11px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; min-width: 250px"
      />
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Función Sustantiva</th>
          <th>Actividad y Lineamiento (ANEXO 4)</th>
          <th>Base (Mín)</th>
          <th>Tope (Máx)</th>
          <th>Pre-Aval V.A.</th>
          <th>Severidad Regla (RF-07)</th>
          <th style="text-align: right">Detalle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="codeItem in filteredCodes" :key="codeItem.code">
          <td data-label="Código">
            <span class="code-chip">{{ codeItem.code }}</span>
          </td>
          <td data-label="Función">
            <span class="badge inscrito">{{ codeItem.substantiveFunction }}</span>
          </td>
          <td data-label="Actividad">
            <b style="color: var(--navy); font-size: 12px">
              {{ codeItem.name.replace('TUNJA ', '') }}
            </b>
            <div style="font-size: 11px; color: var(--ink-soft); margin-top: 2px">
              {{ codeItem.guideline }}
            </div>
            <div
              v-if="codeItem.facultyRules && codeItem.facultyRules.length > 0"
              style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 4px"
            >
              <span
                v-for="rf in codeItem.facultyRules"
                :key="rf.unitId"
                class="badge aprobado"
                style="font-size: 10px"
              >
                🎯 {{ rf.unitName }}: {{ rf.minTeacherHours ?? 0 }}–{{
                  rf.maxTeacherHours ?? '∞'
                }}h
                <template v-if="rf.facultyBagCap">
                  (Bolsa: {{ rf.facultyBagCap }}h)
                </template>
              </span>
            </div>
          </td>
          <td data-label="Base (Mín)">
            <input
              v-if="codeItem.baseHours !== null"
              :value="codeItem.baseHours"
              type="number"
              min="0"
              max="240"
              style="width: 62px; padding: 4px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              @change="store.updateSacCode(codeItem.code, { baseHours: eventNumber($event) })"
            />
            <span
              v-else
              style="font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-faint)"
            >
              {{ codeItem.psePercentage ? `${codeItem.psePercentage}%` : '—' }}
            </span>
          </td>
          <td data-label="Tope (Máx)">
            <input
              v-if="codeItem.capHours !== null"
              :value="codeItem.capHours"
              type="number"
              min="0"
              max="240"
              style="width: 62px; padding: 4px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 12px"
              @change="store.updateSacCode(codeItem.code, { capHours: eventNumber($event) })"
            />
            <span
              v-else
              style="font-family: var(--font-mono); font-size: 11.5px; color: var(--ink-faint)"
            >
              {{ codeItem.psePercentage ? 'Auto 25%' : 'Según aval' }}
            </span>
            <div
              v-if="codeItem.postgraduateCapHours"
              style="font-size: 10px; color: var(--blue); font-weight: 700"
            >
              Posgrado: {{ codeItem.postgraduateCapHours }}h
            </div>
          </td>
          <td data-label="Pre-Aval V.A.">
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
              <span style="font-size: 11px; font-weight: 700">
                {{ codeItem.requiresViceRectorApproval ? 'ANEXO 3' : 'No' }}
              </span>
            </label>
          </td>
          <td data-label="Severidad">
            <select
              :value="codeItem.severity"
              style="padding: 4px 7px; border: 1.5px solid var(--border); border-radius: 6px; font-size: 11px; font-weight: 600"
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
          <td data-label="Detalle" style="text-align: right">
            <button class="btn ghost small" @click="emit('editCode', codeItem)">
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
