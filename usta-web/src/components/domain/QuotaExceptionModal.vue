<script setup lang="ts">
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
}

const props = defineProps<{
  state: ExceptionModalState | null;
  teacher: FacultyTeacher | undefined;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();

function handleSave() {
  if (!props.teacher || !props.state) return;
  const s = props.state;
  if (s.exceedsCap && store.activeRole === 'dean') {
    if (!s.confirmStep1 || !s.confirmStep2 || !s.confirmStep3) {
      store.showToast(
        'Debes marcar las 3 verificaciones de seguridad para autorizar una excepción de tope (RF-19)',
        'error',
      );
      return;
    }
    if (!s.justification.trim()) {
      store.showToast(
        'La justificación escrita del Decano es obligatoria cuando se supera el tope del ANEXO 4',
        'error',
      );
      return;
    }
  }
  store.updateCodeAllocation(
    props.teacher.id,
    s.codeItem.code,
    s.hours,
    s.justification,
    s.directorNote,
  );
  store.showToast(
    `Excepción / observación registrada en código ${s.codeItem.code} (${s.hours} h)`,
  );
  emit('close');
}
</script>

<template>
  <UstaModal
    :open="!!state"
    :title="
      state
        ? store.activeRole === 'director'
          ? `Revisión y Ajuste Directo — Código ${state.codeItem.code}`
          : state.exceedsCap
            ? `⚠ Confirmación de Excepción de Tope (RF-19) — Código ${state.codeItem.code}`
            : `Notas y Justificación de Excepción — Código ${state.codeItem.code}`
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
          <b>Superación de Tope Normativo (ANEXO 4):</b> Estás intentando asignar
          <b>{{ state.hours }} h/mes</b> en el código
          <b>{{ state.codeItem.code }}</b>, cuyo tope máximo autorizado es de
          <b>{{ state.referenceCap }} h/mes</b>.
        </div>
      </div>

      <div class="field">
        <label>
          Horas mensuales asignadas (Rango ANEXO 4:
          {{ state.codeItem.baseHours ?? 0 }} –
          {{ state.referenceCap ?? state.codeItem.capHours ?? 'Aval' }} h)
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
          Verificación Obligatoria de 3 Pasos para Superar el Tope (RF-19):
        </b>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; margin-bottom: 6px; cursor: pointer"
        >
          <input v-model="state.confirmStep1" type="checkbox" style="margin-top: 2px" />
          <span>
            <b>1/3:</b> Confirmo que conozco que el tope máximo del código
            <b>{{ state.codeItem.code }}</b> es de
            <b>{{ state.referenceCap }} h/mes</b> según los lineamientos de nómina.
          </span>
        </label>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; margin-bottom: 6px; cursor: pointer"
        >
          <input v-model="state.confirmStep2" type="checkbox" style="margin-top: 2px" />
          <span>
            <b>2/3:</b> Confirmo que esta excepción responde a una necesidad académica excepcional con soporte verificable del programa.
          </span>
        </label>
        <label
          style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; cursor: pointer"
        >
          <input v-model="state.confirmStep3" type="checkbox" style="margin-top: 2px" />
          <span>
            <b>3/3:</b> Solicito formalmente que esta excepción quede marcada en la bandeja y bitácora para aval expreso de la Directora de Enseñanza y Aprendizaje.
          </span>
        </label>
      </div>

      <div class="field">
        <label>Justificación del Decano (Obligatoria al superar un tope flexible - RF-19)</label>
        <textarea
          v-model="state.justification"
          placeholder="Explica por qué se requiere esta asignación en el semestre…"
        ></textarea>
      </div>

      <div v-if="store.activeRole === 'director'" class="field">
        <label>Observación de Revisión de la Directora E&A (RF-22, RF-24)</label>
        <textarea
          v-model="state.directorNote"
          placeholder="Escribe la observación o el motivo del ajuste acordado en la jornada de revisión…"
        ></textarea>
      </div>
    </template>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">
        Guardar y Registrar en Bitácora
      </button>
    </template>
  </UstaModal>
</template>
