<script setup lang="ts">
/**
 * Annex 5 academic program quota table supporting inline cap edits (`30411`/`40106`/`40109`/`40127`)
 * and cohort activation toggles that recalculate parent unit bags.
 */
import { computed, ref } from 'vue';
import type { ProgramQuotaAnnex5 } from '@usta/domain';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import { eventChecked, eventNumber } from '@/utils/dom-events';

const emit = defineEmits<{
  newProgram: [];
  editProgram: [program: ProgramQuotaAnnex5];
}>();

const store = usePayrollStore();
const programUnitFilter = ref<string>('TODAS');
const programPendingDelete = ref<ProgramQuotaAnnex5 | null>(null);

const filteredPrograms = computed(() => {
  if (programUnitFilter.value === 'TODAS') return store.programQuotas;
  return store.programQuotas.filter((p) => p.unitId === programUnitFilter.value);
});

async function confirmRemoveProgram() {
  if (!programPendingDelete.value) return;
  const res = await store.removeProgram(programPendingDelete.value.id);
  if (res.ok) {
    programPendingDelete.value = null;
  }
}
</script>

<template>
  <div class="card" style="padding: 16px 18px">
    <div
      style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px"
    >
      <div>
        <div class="section-label" style="margin: 0">
          Desglose por programa académico (Anexo 5)
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin: 3px 0 0">
          Al activar o excluir una cohorte se recalcula automáticamente la bolsa de la unidad.
        </p>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <select v-model="programUnitFilter" class="control-sm">
          <option value="TODAS">Todas las unidades</option>
          <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
            {{ unit.name }}
          </option>
        </select>
        <button type="button" class="btn primary small" style="height: 34px" @click="emit('newProgram')">
          Nuevo programa
        </button>
      </div>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th style="width: 14%">Unidad</th>
          <th style="width: 24%">Programa académico</th>
          <th class="col-center" style="width: 12%">Nivel y modalidad</th>
          <th style="width: 16%">Acreditación y observaciones</th>
          <th class="col-center">30411 Cal.</th>
          <th class="col-center">40106 Curr.</th>
          <th class="col-center">40109 SEA</th>
          <th class="col-center">40127 S.Pro</th>
          <th class="col-center">Cohorte</th>
          <th class="col-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredPrograms.length === 0">
          <td colspan="10" class="empty-note" style="padding: 20px 16px; text-align: center">
            Sin programas registrados para la unidad seleccionada.
          </td>
        </tr>
        <tr v-for="program in filteredPrograms" :key="program.id">
          <td><b style="color: var(--navy); font-size: 12px">{{ program.unitName }}</b></td>
          <td>
            <b
              style="color: var(--navy); font-size: 12px; cursor: pointer"
              title="Editar programa académico"
              @click="emit('editProgram', program)"
            >
              {{ program.programName }}
            </b>
          </td>
          <td class="col-center">
            <span class="badge inscrito" style="white-space: nowrap">
              {{ program.level }} · {{ program.modality }}
            </span>
          </td>
          <td style="font-size: 11px; color: var(--ink-soft); line-height: 1.3">
            {{ program.accreditationStatus }}
            <div
              v-if="
                program.curriculumNotes &&
                program.curriculumNotes.trim() !== program.accreditationStatus.trim()
              "
              style="color: var(--blue); margin-top: 2px"
            >
              {{ program.curriculumNotes }}
            </div>
          </td>
          <td class="col-center">
            <input
              :value="program.quality30411"
              type="number"
              min="0"
              max="150"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateProgram(program.id, { quality30411: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="program.curriculum40106"
              type="number"
              min="0"
              max="150"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateProgram(program.id, { curriculum40106: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="program.sea40109"
              type="number"
              min="0"
              max="80"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateProgram(program.id, { sea40109: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <input
              :value="program.saberPro40127"
              type="number"
              min="0"
              max="80"
              step="4"
              class="table-input table-input--num"
              style="width: 48px"
              @change="store.updateProgram(program.id, { saberPro40127: eventNumber($event) })"
            />
          </td>
          <td class="col-center">
            <label
              class="toggle"
              title="Define si la cohorte suma a la bolsa semestral de la unidad (Anexo 5)"
            >
              <input
                :checked="program.isActive"
                type="checkbox"
                @change="store.updateProgram(program.id, { isActive: eventChecked($event) })"
              />
              <span class="toggle__track"></span>
              <span style="font-size: 11px; font-weight: 700; white-space: nowrap">
                {{ program.isActive ? 'Activa' : 'Excluida' }}
              </span>
            </label>
          </td>
          <td class="col-right" style="white-space: nowrap">
            <div style="display: inline-flex; align-items: center; gap: 5px; justify-content: flex-end">
              <button
                type="button"
                class="btn ghost small"
                title="Editar programa académico"
                @click="emit('editProgram', program)"
              >
                Editar
              </button>
              <button
                type="button"
                class="btn danger icon small"
                style="font-size: 15px; line-height: 1"
                title="Eliminar programa académico"
                @click="programPendingDelete = program"
              >
                ×
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <UstaModal
      :open="!!programPendingDelete"
      title="Eliminar programa académico"
      subtitle="Se retirará del Anexo 5 y se recalcularán los topes de la unidad."
      @close="programPendingDelete = null"
    >
      <p v-if="programPendingDelete" class="sub" style="margin: 0">
        ¿Desea eliminar el programa <b>{{ programPendingDelete.programName }}</b> ({{ programPendingDelete.unitName }})?
      </p>
      <template #actions>
        <button type="button" class="btn ghost" @click="programPendingDelete = null">
          Cancelar
        </button>
        <button type="button" class="btn danger" @click="confirmRemoveProgram">
          Eliminar programa
        </button>
      </template>
    </UstaModal>
  </div>
</template>
