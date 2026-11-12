<script setup lang="ts">
/**
 * Modal form for creating or editing Annex 7 research allocations on career faculty (`TC`/`MT`),
 * enforcing Agreement 3 of 2025 fixed hour tiers (`20`/`80`/`136` h/month) for SICDDI code `10226`.
 */
import { computed, ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { ResearchAllocationAnnex7 } from '@usta/domain';

const props = defineProps<{
  open: boolean;
  editingItem: ResearchAllocationAnnex7 | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'save',
    payload: Omit<ResearchAllocationAnnex7, 'id' | 'period'>,
    editingId: string | null,
  ): void;
}>();

const store = usePayrollStore();

const form = ref({
  unitId: '',
  selectedTeacherId: '',
  documentId: '',
  teacherName: '',
  code: '10336',
  activityName: 'Desarrollo de Proyectos de Investigación (FODEIN)',
  projectOrGroup: '',
  role: 'Investigador Principal',
  sicddiLevel: null as 'Nivel I (20h)' | 'Nivel II (80h)' | 'Nivel III (136h)' | null,
  monthlyHours: 36,
  notes: '',
});

const modalUnitTeachers = computed(() =>
  store.teachers.filter(
    (t) => t.unitId === form.value.unitId && t.dedication !== 'CATEDRA',
  ),
);

function resetFormForCreate() {
  const defaultUnitId = store.units[0]?.id ?? '';
  const unitTeachers = store.teachers.filter(
    (t) => t.unitId === defaultUnitId && t.dedication !== 'CATEDRA',
  );
  const firstTeacher = unitTeachers[0];
  form.value = {
    unitId: defaultUnitId,
    selectedTeacherId: firstTeacher?.id ?? '',
    documentId: firstTeacher?.documentId ?? '',
    teacherName: firstTeacher?.fullName ?? '',
    code: '10336',
    activityName: 'Desarrollo de Proyectos de Investigación (FODEIN)',
    projectOrGroup: '',
    role: 'Investigador Principal',
    sicddiLevel: null,
    monthlyHours: 36,
    notes: '',
  };
}

watch(
  () => [props.open, props.editingItem] as const,
  ([isOpen, item]) => {
    if (!isOpen) return;
    if (item) {
      const teacher = store.teachers.find((t) => t.documentId === item.documentId);
      form.value = {
        unitId: item.unitId,
        selectedTeacherId: teacher?.id ?? '',
        documentId: item.documentId,
        teacherName: item.teacherName,
        code: item.code,
        activityName: item.activityName,
        projectOrGroup: item.projectOrGroup,
        role: item.role,
        sicddiLevel: item.sicddiLevel ?? null,
        monthlyHours: item.monthlyHours,
        notes: item.notes ?? '',
      };
    } else {
      resetFormForCreate();
    }
  },
  { immediate: true },
);

watch(
  () => form.value.unitId,
  () => {
    if (props.editingItem) return;
    const first = modalUnitTeachers.value[0];
    if (first) {
      form.value.selectedTeacherId = first.id;
      form.value.documentId = first.documentId;
      form.value.teacherName = first.fullName;
    } else {
      form.value.selectedTeacherId = '';
      form.value.documentId = '';
      form.value.teacherName = '';
    }
  },
);

watch(
  () => [form.value.code, form.value.sicddiLevel],
  () => {
    if (form.value.code === '10226') {
      form.value.activityName = 'Docente Investigador Escalafonado SICDDI';
      if (!form.value.sicddiLevel) form.value.sicddiLevel = 'Nivel I (20h)';
      if (form.value.sicddiLevel === 'Nivel I (20h)') form.value.monthlyHours = 20;
      else if (form.value.sicddiLevel === 'Nivel II (80h)') form.value.monthlyHours = 80;
      else if (form.value.sicddiLevel === 'Nivel III (136h)') form.value.monthlyHours = 136;
    } else {
      form.value.sicddiLevel = null;
      const def = store.sacCodes.find((c) => c.code === form.value.code);
      if (def) form.value.activityName = def.name.replace('TUNJA ', '');
    }
  },
);

function handleSelectExistingTeacher(event: Event): void {
  const id = (event.target as HTMLSelectElement).value;
  const teacher = store.teachers.find((t) => t.id === id);
  if (teacher) {
    form.value.documentId = teacher.documentId;
    form.value.teacherName = teacher.fullName;
  }
}

function handleDocumentIdLookup(): void {
  const cc = form.value.documentId.trim();
  if (!cc) return;
  const teacher = store.teachers.find((t) => t.documentId === cc);
  if (teacher) {
    if (teacher.dedication === 'CATEDRA') {
      store.showToast(
        'No se permite asignar horas de investigación (Anexo 7) a docentes de cátedra.',
        'error',
      );
      return;
    }
    form.value.unitId = teacher.unitId;
    form.value.selectedTeacherId = teacher.id;
    form.value.teacherName = teacher.fullName;
  }
}

function handleSubmit(): void {
  if (!form.value.documentId.trim() || !form.value.teacherName.trim()) {
    store.showToast('Seleccione un docente o indique su cédula y nombre.', 'error');
    return;
  }
  const matchedTeacher = store.teachers.find(
    (t) =>
      t.documentId === form.value.documentId.trim() && t.unitId === form.value.unitId,
  );
  if (matchedTeacher?.dedication === 'CATEDRA') {
    store.showToast(
      'No se permite asignar horas de investigación (Anexo 7) a docentes de cátedra.',
      'error',
    );
    return;
  }
  const unit = store.units.find((u) => u.id === form.value.unitId);
  emit(
    'save',
    {
      unitId: form.value.unitId,
      unitName: unit?.name ?? '',
      documentId: form.value.documentId.trim(),
      teacherName: form.value.teacherName.trim().toUpperCase(),
      code: form.value.code,
      activityName: form.value.activityName,
      projectOrGroup:
        form.value.projectOrGroup.trim() || `Asignación ${form.value.code} (${store.activePeriod})`,
      role: form.value.role,
      sicddiLevel: form.value.sicddiLevel,
      weeklyHours: Math.round((form.value.monthlyHours / 4) * 10) / 10,
      monthlyHours: form.value.monthlyHours,
      isSicddiLocked: form.value.code === '10226',
      notes: form.value.notes.trim(),
    },
    props.editingItem?.id ?? null,
  );
}
</script>

<template>
  <UstaModal
    :open="open"
    :title="
      editingItem
        ? 'Editar asignación de investigación (Anexo 7)'
        : 'Registrar horas de investigación (Anexo 7)'
    "
    subtitle="Seleccione un docente de planta o busque su cédula. Las horas se aplicarán en su prenómina."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Unidad académica</label>
        <select v-model="form.unitId">
          <option v-for="u in store.units" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>Docente de planta</label>
        <select v-model="form.selectedTeacherId" @change="handleSelectExistingTeacher">
          <option v-for="t in modalUnitTeachers" :key="t.id" :value="t.id">
            {{ t.fullName }} ({{ t.dedication }} · CC {{ t.documentId }})
          </option>
        </select>
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Cédula del docente</label>
        <input
          v-model="form.documentId"
          type="text"
          placeholder="Buscar por número de cédula…"
          @input="handleDocumentIdLookup"
        />
      </div>
      <div class="field">
        <label>Nombre del docente</label>
        <input v-model="form.teacherName" type="text" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Código SAC de investigación</label>
        <select v-model="form.code">
          <option value="10336">10336 — Proyectos de investigación</option>
          <option value="10226">10226 — Investigador escalafonado SICDDI</option>
          <option value="10318">10318 — Líder de grupo de investigación</option>
          <option value="10384">10384 — Coordinador de investigación</option>
          <option value="10225">10225 — Centro CEDETS</option>
          <option value="S/C-CITECDES">S/C-CITECDES — Centro CITECDES</option>
          <option value="10340">10340 — Editor de revista científica</option>
        </select>
      </div>

      <div v-if="form.code === '10226'" class="field">
        <label>Nivel SICDDI (Acuerdo 3 — horas fijas)</label>
        <select v-model="form.sicddiLevel">
          <option value="Nivel I (20h)">Nivel I — 20 h/mes fijas</option>
          <option value="Nivel II (80h)">Nivel II — 80 h/mes fijas</option>
          <option value="Nivel III (136h)">Nivel III — 136 h/mes fijas</option>
        </select>
      </div>
      <div v-else class="field">
        <label>Horas aprobadas al mes</label>
        <input v-model.number="form.monthlyHours" type="number" min="1" max="136" />
      </div>
    </div>

    <div class="field">
      <label>Proyecto, grupo o estrategia</label>
      <input
        v-model="form.projectOrGroup"
        type="text"
        placeholder="Código de convocatoria, proyecto o grupo…"
      />
    </div>

    <template #actions>
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" @click="handleSubmit">
        {{ editingItem ? 'Guardar cambios' : 'Guardar asignación' }}
      </button>
    </template>
  </UstaModal>
</template>
