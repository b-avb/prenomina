<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber, eventValue } from '@/utils/dom-events';

const emit = defineEmits<{
  newProgram: [];
}>();

const store = usePayrollStore();

const programUnitFilter = ref('TODAS');
const programLevelFilter = ref('TODOS');
const programSearchQuery = ref('');

const filteredPrograms = computed(() => {
  const query = programSearchQuery.value.trim().toLowerCase();
  return store.programQuotas.filter((program) => {
    const matchesUnit =
      programUnitFilter.value === 'TODAS' || program.unitId === programUnitFilter.value;
    const matchesLevel =
      programLevelFilter.value === 'TODOS' ||
      (programLevelFilter.value === 'Pregrado' && program.level === 'Pregrado') ||
      (programLevelFilter.value === 'Posgrado' && program.level !== 'Pregrado');
    const matchesQuery =
      !query ||
      program.programName.toLowerCase().includes(query) ||
      program.unitName.toLowerCase().includes(query) ||
      program.accreditationStatus.toLowerCase().includes(query);
    return matchesUnit && matchesLevel && matchesQuery;
  });
});
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Programas Académicos de Pregrado y Posgrado (Sincronización Automática ANEXO 5)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Crea nuevos programas de pregrado, especializaciones, maestrías o doctorados y activa o excluye su cohorte para actualizar las bolsas de cada facultad.
        </p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <select
          v-model="programUnitFilter"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--navy)"
        >
          <option value="TODAS">Todas las Facultades</option>
          <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
            {{ unit.name }}
          </option>
        </select>

        <select
          v-model="programLevelFilter"
          style="padding: 6px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--navy)"
        >
          <option value="TODOS">Todos los Niveles</option>
          <option value="Pregrado">Solo Pregrado</option>
          <option value="Posgrado">Solo Posgrado</option>
        </select>

        <input
          v-model="programSearchQuery"
          type="search"
          placeholder="Buscar programa o facultad…"
          style="padding: 6px 12px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; width: 220px"
        />

        <button class="btn primary small" @click="emit('newProgram')">
          + Crear Nuevo Programa
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Facultad / Unidad</th>
          <th>Nombre del Programa Académico</th>
          <th>Nivel / Modalidad</th>
          <th>Estado Acreditación / Observación</th>
          <th>30411 Cal.</th>
          <th>40106 Curr.</th>
          <th>40109 SEA</th>
          <th>40127 S.Pro</th>
          <th>Cohorte Activa</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="program in filteredPrograms" :key="program.id">
          <td>
            <b style="color: var(--navy)">{{ program.unitName }}</b>
          </td>
          <td>
            <input
              :value="program.programName"
              type="text"
              style="width: 100%; min-width: 220px; padding: 4px 7px; border: 1px solid var(--border); border-radius: 6px; font-size: 11.5px; font-weight: 700; color: var(--navy)"
              @change="
                store.updateProgram(program.id, {
                  programName: eventValue($event).trim().toUpperCase(),
                })
              "
            />
          </td>
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
              title="Eliminar programa académico"
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
