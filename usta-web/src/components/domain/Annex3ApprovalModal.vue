<script setup lang="ts">
import { computed } from 'vue';
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

async function handleSubmit() {
  if (!props.teacher || !props.state) return;
  const s = props.state;
  const totalHours = totalModalHours.value;
  await store.updateCodeAllocation(props.teacher.id, s.codeItem.code, totalHours);
  const res = await store.registerApprovalRequest({
    unitId: store.activeUnit.id,
    unitName: store.activeUnit.name,
    teacherId: props.teacher.id,
    teacherName: props.teacher.fullName,
    teacherDocumentId: props.teacher.documentId,
    code: s.codeItem.code,
    codeName: s.codeItem.name,
    requestedHours: totalHours,
    formatType: s.codeItem.annex3Format || '10212',
    programName: s.programName,
    projectDetails: s.rows.map((r, idx) => ({
      title: r.title || `Ítem #${idx + 1} — ${s.codeItem.name}`,
      projectType: r.projectType,
      studentsOrCourse: r.studentsOrCourse || 'Según listado adjunto',
      committeeApprovalMinute: r.committeeApprovalMinute,
      hours: Number(r.hours) || 0,
    })),
    attachmentUrl: s.attachmentUrl,
  });
  if (res.ok) emit('close');
}
</script>

<template>
  <UstaModal
    :open="!!state"
    title="Formato Digital de Solicitud de Pre-Aval V.A. (ANEXO 3)"
    wide
    @close="emit('close')"
  >
    <template v-if="state">
      <p class="sub" style="margin-top: 0">
        Estructura oficial del formato <b>ANEXO 3 ({{ state.codeItem.code }})</b> para
        <b>{{ teacher?.fullName }}</b>.
      </p>

      <div class="lineamiento-popover" style="margin-bottom: 14px">
        <div class="lineamiento-popover__head">
          <span>
            Código {{ state.codeItem.code }} · {{ state.codeItem.name }}
          </span>
          <span class="code-chip">Total calculado: {{ totalModalHours }} h/mes</span>
        </div>
        <div class="lineamiento-popover__body">
          {{ state.codeItem.guideline }}
        </div>
      </div>

      <div class="grid cols-2">
        <div class="field">
          <label>Programa Académico / Departamento</label>
          <input v-model="state.programName" type="text" />
        </div>
        <div class="field">
          <label>Soporte Adjunto (Acta de Comité / Aval Campus Virtual)</label>
          <div style="display: flex; gap: 6px">
            <input v-model="state.attachmentUrl" type="text" style="flex: 1" />
            <label class="btn ghost small" style="cursor: pointer; white-space: nowrap; margin: 0">
              📎 Subir PDF
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xlsx"
                style="display: none"
                @change="
                  (ev) => {
                    const f = (ev.target as HTMLInputElement).files?.[0];
                    if (f && state) state.attachmentUrl = f.name;
                  }
                "
              />
            </label>
          </div>
        </div>
      </div>

      <div
        style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0"
      >
        <b style="color: var(--navy); font-size: 12.5px">
          Relación de Proyectos / Consultorios / Cursos ({{ state.rows.length }} registro(s))
        </b>
        <button class="btn ghost small" @click="addRow">
          + Agregar Proyecto / Ítem
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
            class="btn danger small"
            @click="removeRow(idx)"
          >
            Quitar
          </button>
        </div>
        <div class="field" style="margin-bottom: 8px">
          <label>Denominación del Proyecto / Consultorio / Curso / Área</label>
          <input
            v-model="row.title"
            type="text"
            placeholder="Título del proyecto de grado, consultorio, curso de extensión o módulo a virtualizar…"
          />
        </div>
        <div class="grid cols-3">
          <div class="field" style="margin-bottom: 0">
            <label>Tipo / Modalidad</label>
            <input v-model="row.projectType" type="text" />
          </div>
          <div class="field" style="margin-bottom: 0">
            <label>Estudiantes / Créditos / Acta</label>
            <input
              v-model="row.studentsOrCourse"
              type="text"
              placeholder="Nombres de estudiantes o créditos…"
            />
          </div>
          <div class="field" style="margin-bottom: 0">
            <label>Horas/Mes</label>
            <input v-model.number="row.hours" type="number" min="1" max="80" />
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSubmit">
        Radicar Solicitud ({{ totalModalHours }} h/mes) a Vicerrectoría
      </button>
    </template>
  </UstaModal>
</template>
