<script setup lang="ts">
import { computed, ref } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { SacCode, FacultyTeacher } from '@usta/domain';

export interface ExceptionModalState {
  codeItem: SacCode;
  hours: number;
  referenceCap: number | null;
  exceedsCap: boolean;
  confirmStep1: boolean;
  confirmStep2: boolean;
  confirmStep3: boolean;
  justification: string;
  directorNote: string;
  programId?: string | null;
  programName?: string | null;
}

const props = defineProps<{
  state: ExceptionModalState | null;
  teacher: FacultyTeacher | undefined;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();
const isSaving = ref(false);

const canWriteReviewerNote = computed(
  () => store.activeRole === 'director' || store.activeRole === 'vice_rector',
);

async function handleSave() {
  if (!props.teacher || !props.state) return;
  const s = props.state;
  if (s.exceedsCap && store.activeRole === 'dean') {
    if (!s.confirmStep1 || !s.confirmStep2 || !s.confirmStep3) {
      store.showToast(
        'Marque las tres confirmaciones para registrar la excepción de tope.',
        'error',
      );
      return;
    }
    if (!s.justification.trim()) {
      store.showToast(
        'Indique la justificación académica para superar el tope del Anexo 4.',
        'error',
      );
      return;
    }
  }
  const hasProgramOverride = s.programId !== undefined || s.programName !== undefined;
  isSaving.value = true;
  try {
    const res = await store.updateCodeAllocation(
      props.teacher.id,
      s.codeItem.code,
      s.hours,
      s.justification,
      canWriteReviewerNote.value ? s.directorNote : undefined,
      hasProgramOverride
        ? { programId: s.programId ?? null, programName: s.programName ?? null }
        : undefined,
    );
    if (res.ok) {
      store.showToast(
        `Asignación actualizada en el código ${s.codeItem.code} (${s.hours} h).`,
      );
      emit('close');
    }
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <UstaModal
    :open="!!state"
    :title="
      state
        ? canWriteReviewerNote
          ? `Ajuste de revisión — Código ${state.codeItem.code}`
          : state.exceedsCap
            ? `Excepción de tope — Código ${state.codeItem.code}`
            : `Observación sobre asignación — Código ${state.codeItem.code}`
        : ''
    "
    @close="emit('close')"
  >
    <template v-if="state">
      <p class="sub" style="margin-top: 0">
        {{ state.codeItem.name }} · Docente: <b>{{ teacher?.fullName }}</b>
      </p>

      <div
        v-if="state.exceedsCap"
        class="validation-banner warning"
        style="margin-bottom: 12px"
      >
        <div>
          <b>Tope del Anexo 4 superado:</b> La asignación de
          <b>{{ state.hours }} h/mes</b> supera el máximo de
          <b>{{ state.referenceCap }} h/mes</b> definido para el código
          <b>{{ state.codeItem.code }}</b>.
        </div>
      </div>

      <div class="field">
        <label>
          Horas mensuales asignadas (rango Anexo 4:
          {{ state.codeItem.baseHours ?? 0 }} –
          {{ state.referenceCap ?? state.codeItem.capHours ?? 'Según aval' }} h)
        </label>
        <input
          v-model.number="state.hours"
          type="number"
          min="0"
          max="240"
          step="2"
          @input="
            state.exceedsCap =
              state.referenceCap !== null && state.hours > state.referenceCap
          "
        />
      </div>

      <div
        v-if="state.exceedsCap"
        style="background: var(--surface-soft); border: 1.5px solid var(--gold); border-radius: 10px; padding: 12px; margin-bottom: 12px"
      >
        <b style="font-size: 12px; color: var(--navy); display: block; margin-bottom: 8px">
          Confirmaciones requeridas para superar el tope:
        </b>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; margin-bottom: 6px; cursor: pointer"
        >
          <input v-model="state.confirmStep1" type="checkbox" style="margin-top: 2px" />
          <span>
            Conozco el tope máximo de <b>{{ state.referenceCap }} h/mes</b> establecido para el código
            <b>{{ state.codeItem.code }}</b>.
          </span>
        </label>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; margin-bottom: 6px; cursor: pointer"
        >
          <input v-model="state.confirmStep2" type="checkbox" style="margin-top: 2px" />
          <span>
            La asignación responde a una necesidad académica con soporte verificable del programa.
          </span>
        </label>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; cursor: pointer"
        >
          <input v-model="state.confirmStep3" type="checkbox" style="margin-top: 2px" />
          <span>
            Solicito revisión expresa de esta excepción por parte de la Dirección de Enseñanza y Aprendizaje.
          </span>
        </label>
      </div>

      <div class="field">
        <label>Justificación de la unidad académica</label>
        <textarea
          v-model="state.justification"
          placeholder="Describa la necesidad académica que respalda esta asignación…"
        ></textarea>
      </div>

      <div v-if="canWriteReviewerNote" class="field">
        <label>Observación de revisión</label>
        <textarea
          v-model="state.directorNote"
          placeholder="Registre la observación o el motivo del ajuste acordado…"
        ></textarea>
      </div>
    </template>

    <template #actions>
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" :disabled="isSaving" @click="handleSave">
        {{ isSaving ? 'Guardando…' : 'Guardar' }}
      </button>
    </template>
  </UstaModal>
</template>
