<script setup lang="ts">
/**
 * Modal form for authoring Annex 3 Vice-Rectory pre-approval requests, uploading supporting
 * evidence, and synchronizing the teacher's SAC hour allocation upon submission.
 */
import { computed, ref } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { SacCode, FacultyTeacher, ApprovalProjectDetail } from '@usta/domain';

export interface Annex3ModalState {
  codeItem: SacCode;
  programName: string;
  attachmentUrl: string;
  rows: ApprovalProjectDetail[];
}

const props = defineProps<{
  state: Annex3ModalState | null;
  teacher: FacultyTeacher | undefined;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();
const isUploading = ref(false);
const isSubmitting = ref(false);

const totalModalHours = computed(() => {
  if (!props.state) return 0;
  return props.state.rows.reduce((acc, r) => acc + (Number(r.hours) || 0), 0);
});

function addRow() {
  if (!props.state) return;
  const code = props.state.codeItem.code;
  const defaultFactor = code === '10212' ? 4 : code === '20223' || code === '20120' ? 2 : 4;
  props.state.rows.push({
    title: '',
    projectType:
      code === '10212'
        ? 'Proyecto de Investigación'
        : 'Opción de Grado Social / Práctica',
    studentsOrCourse: '',
    committeeApprovalMinute: `Acta Comité Curricular — ${store.activePeriod}`,
    hours: defaultFactor,
  });
}

function removeRow(index: number) {
  if (!props.state || props.state.rows.length <= 1) return;
  props.state.rows.splice(index, 1);
}

async function handleFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !props.state) return;
  isUploading.value = true;
  try {
    const res = await store.uploadApprovalAttachment(file);
    if (res.ok && props.state) {
      props.state.attachmentUrl = res.data.url;
    }
  } finally {
    isUploading.value = false;
    input.value = '';
  }
}

async function handleSubmit() {
  if (!props.teacher || !props.state) return;
  const s = props.state;
  const totalHours = totalModalHours.value;
  if (totalHours <= 0) {
    store.showToast('Indique un total de horas mayor a cero para radicar la solicitud.', 'error');
    return;
  }
  if (!s.programName.trim()) {
    store.showToast('Indique el programa académico o la unidad solicitante.', 'error');
    return;
  }

  const targetUnit =
    store.units.find((u) => u.id === props.teacher!.unitId) ?? store.activeUnit;

  isSubmitting.value = true;
  try {
    // Synchronize the teacher's SAC hour allocation first so the Annex 3 request matches active workload.
    const allocRes = await store.updateCodeAllocation(
      props.teacher.id,
      s.codeItem.code,
      totalHours,
    );
    if (!allocRes.ok) return;

    const res = await store.registerApprovalRequest({
      unitId: targetUnit.id,
      unitName: targetUnit.name,
      teacherId: props.teacher.id,
      teacherName: props.teacher.fullName,
      teacherDocumentId: props.teacher.documentId,
      code: s.codeItem.code,
      codeName: s.codeItem.name,
      requestedHours: totalHours,
      formatType: s.codeItem.annex3Format || '10212',
      programName: s.programName.trim(),
      projectDetails: s.rows.map((r, idx) => ({
        title: r.title.trim() || `Ítem #${idx + 1} — ${s.codeItem.name}`,
        projectType: r.projectType.trim() || 'Actividad Especial',
        studentsOrCourse: r.studentsOrCourse.trim() || 'Según listado en soporte',
        committeeApprovalMinute:
          r.committeeApprovalMinute.trim() ||
          `Acta Comité Curricular — ${store.activePeriod}`,
        hours: Number(r.hours) || 0,
      })),
      attachmentUrl: s.attachmentUrl.trim(),
    });
    if (res.ok) emit('close');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <UstaModal
    :open="!!state"
    title="Solicitud de aval de Vicerrectoría Académica (Anexo 3)"
    wide
    @close="emit('close')"
  >
    <template v-if="state">
      <p class="sub" style="margin-top: 0">
        Solicitud en formato <b>Anexo 3 ({{ state.codeItem.code }})</b> para
        <b>{{ teacher?.fullName }}</b>.
      </p>

      <div class="lineamiento-popover" style="margin-bottom: 14px">
        <div class="lineamiento-popover__head">
          <span>
            Código {{ state.codeItem.code }} · {{ state.codeItem.name }}
          </span>
          <span class="code-chip">Total: {{ totalModalHours }} h/mes</span>
        </div>
        <div class="lineamiento-popover__body">
          {{ state.codeItem.guideline }}
        </div>
      </div>

      <div class="grid cols-2">
        <div class="field">
          <label>Programa académico o unidad solicitante</label>
          <input
            v-model="state.programName"
            type="text"
            placeholder="Ej.: Ingeniería Industrial"
          />
        </div>
        <div class="field">
          <label>Soporte documental (archivo o enlace institucional)</label>
          <div style="display: flex; gap: 6px; align-items: center">
            <input
              v-model="state.attachmentUrl"
              type="text"
              placeholder="Suba un archivo o pegue un enlace https://…"
              style="flex: 1"
            />
            <label
              class="btn ghost"
              style="display: inline-flex; align-items: center; height: 42px; padding: 0 12px; font-size: 12px; cursor: pointer; white-space: nowrap; margin: 0"
            >
              {{ isUploading ? 'Subiendo…' : 'Subir archivo' }}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                style="display: none"
                :disabled="isUploading"
                @change="handleFileSelected"
              />
            </label>
            <button
              v-if="state.attachmentUrl.trim()"
              type="button"
              class="btn ghost small"
              style="height: 42px"
              title="Abrir soporte adjunto"
              @click="store.openApprovalAttachment(state.attachmentUrl)"
            >
              Ver
            </button>
          </div>
        </div>
      </div>

      <div
        style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0"
      >
        <b style="color: var(--navy); font-size: 12.5px">
          Proyectos, consultorios o cursos ({{ state.rows.length }}
          {{ state.rows.length === 1 ? 'registro' : 'registros' }})
        </b>
        <button type="button" class="btn ghost small" @click="addRow">
          Agregar registro
        </button>
      </div>

      <div
        v-for="(row, idx) in state.rows"
        :key="idx"
        style="background: var(--surface-soft); padding: 12px; border-radius: 10px; margin-bottom: 10px; border: 1px solid var(--border)"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px"
        >
          <b style="font-size: 12px; color: var(--navy)">Registro #{{ idx + 1 }}</b>
          <button
            v-if="state.rows.length > 1"
            type="button"
            class="btn danger small"
            @click="removeRow(idx)"
          >
            Quitar
          </button>
        </div>
        <div class="field" style="margin-bottom: 8px">
          <label>Nombre del proyecto, consultorio, curso o área</label>
          <input
            v-model="row.title"
            type="text"
            placeholder="Título del proyecto, consultorio, curso de extensión o módulo…"
          />
        </div>
        <div class="grid cols-2" style="margin-bottom: 8px">
          <div class="field" style="margin-bottom: 0">
            <label>Tipo o modalidad</label>
            <input v-model="row.projectType" type="text" />
          </div>
          <div class="field" style="margin-bottom: 0">
            <label>Acta de Comité Curricular o aval</label>
            <input
              v-model="row.committeeApprovalMinute"
              type="text"
              placeholder="Ej.: Acta Comité Curricular No. 08-2026"
            />
          </div>
        </div>
        <div class="grid cols-2">
          <div class="field" style="margin-bottom: 0">
            <label>Estudiantes, créditos o cohorte</label>
            <input
              v-model="row.studentsOrCourse"
              type="text"
              placeholder="Nombres de estudiantes o créditos…"
            />
          </div>
          <div class="field" style="margin-bottom: 0">
            <label>Horas/mes</label>
            <input v-model.number="row.hours" type="number" min="1" max="80" />
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button
        type="button"
        class="btn primary"
        :disabled="isSubmitting || isUploading"
        @click="handleSubmit"
      >
        {{
          isSubmitting
            ? 'Radicando…'
            : `Radicar solicitud (${totalModalHours} h/mes)`
        }}
      </button>
    </template>
  </UstaModal>
</template>
