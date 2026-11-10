<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const emit = defineEmits<{
  newProgram: [];
}>();

const store = usePayrollStore();
const programUnitFilter = ref<string>('TODAS');

const filteredPrograms = computed(() => {
  if (programUnitFilter.value === 'TODAS') return store.programQuotas;
  return store.programQuotas.filter((p) => p.unitId === programUnitFilter.value);
});
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Desglose por Programa Académico y Condición de Cohorte Activa (ANEXO 5)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Al activar o excluir una cohorte (ej. posgrados sujetos a apertura), el sistema recalcula automáticamente la bolsa total de la facultad.
        </p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <select
          v-model="programUnitFilter"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--navy)"
        >
          <option value="TODAS">Todas las Facultades con Desglose</option>
          <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
            {{ unit.name }}
          </option>
        </select>
        <button class="btn primary small" @click="emit('newProgram')">
          + Nuevo Programa / Cohorte
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Facultad</th>
          <th>Programa Académico</th>
          <th>Nivel / Modalidad</th>
          <th>Estado / Observación ANEXO 5</th>
          <th>30411 Cal.</th>
          <th>40106 Curr.</th>
          <th>40109 SEA</th>
          <th>40127 S.Pro</th>
          <th>Cohorte Activa (Sincroniza Bolsa)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="program in filteredPrograms" :key="program.id">
          <td><b>{{ program.unitName }}</b></td>
          <td>{{ program.programName }}</td>
          <td>
            <span class="badge inscrito">{{ program.level }} · {{ program.modality }}</span>
          </td>
          <td style="font-size: 11px; color: var(--ink-soft)">
            {{ program.accreditationStatus }}
            <div v-if="program.curriculumNotes" style="color: var(--blue)">
              {{ program.curriculumNotes }}
            </div>
          </td>
          <td>
            <input
              :value="program.quality30411"
              type="number"
              min="0"
              max="150"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateProgram(program.id, { quality30411: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="program.curriculum40106"
              type="number"
              min="0"
              max="150"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateProgram(program.id, { curriculum40106: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="program.sea40109"
              type="number"
              min="0"
              max="80"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateProgram(program.id, { sea40109: eventNumber($event) })"
            />
          </td>
          <td>
            <input
              :value="program.saberPro40127"
              type="number"
              min="0"
              max="80"
              step="4"
              style="width: 58px; padding: 3px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700"
              @change="store.updateProgram(program.id, { saberPro40127: eventNumber($event) })"
            />
          </td>
          <td>
            <label class="toggle">
              <input
                :checked="program.isActive"
                type="checkbox"
                @change="store.updateProgram(program.id, { isActive: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
              <span style="font-size: 11px; font-weight: 700">
                {{ program.isActive ? 'Incluida en Tope' : 'Excluida' }}
              </span>
            </label>
          </td>
          <td>
            <button
              class="btn danger small"
              title="Eliminar programa del desglose ANEXO 5"
              @click="store.removeProgram(program.id)"
            >
              ×
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
