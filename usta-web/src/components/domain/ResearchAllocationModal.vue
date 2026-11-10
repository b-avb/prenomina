<script setup lang="ts">
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
  store.teachers.filter((t) => t.unitId === form.value.unitId),
);

function resetFormForCreate() {
  const defaultUnitId = store.units[0]?.id ?? '';
  const unitTeachers = store.teachers.filter((t) => t.unitId === defaultUnitId);
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
    form.value.unitId = teacher.unitId;
    form.value.selectedTeacherId = teacher.id;
    form.value.teacherName = teacher.fullName;
  }
}

function handleSubmit(): void {
  if (!form.value.documentId.trim() || !form.value.teacherName.trim()) {
    store.showToast('Debes seleccionar un docente o ingresar su cédula y nombre', 'error');
    return;
  }
  const unit = store.units.find((u) => u.id === form.value.unitId);
  emit(
    'save',
    {
      unitId: form.value.unitId,
      unitName: unit?.name ?? 'Ingeniería Industrial',
      documentId: form.value.documentId,
      teacherName: form.value.teacherName.toUpperCase(),
      code: form.value.code,
      activityName: form.value.activityName,
      projectOrGroup: form.value.projectOrGroup || 'Proyecto Convocatoria FODEIN 2026',
      role: form.value.role,
      sicddiLevel: form.value.sicddiLevel,
      weeklyHours: Math.round((form.value.monthlyHours / 4) * 10) / 10,
      monthlyHours: form.value.monthlyHours,
      isSicddiLocked: form.value.code === '10226',
      notes: form.value.notes,
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
        ? 'Editar Asignación de Investigación (ANEXO 7)'
        : 'Registrar Horas de Investigación por Cédula (RF-29)'
    "
    subtitle="Selecciona un docente de cualquier facultad o digita su cédula; al guardar, las horas se sincronizan automáticamente en su prenómina."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Facultad / Unidad Académica</label>
        <select v-model="form.unitId">
          <option v-for="u in store.units" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>Seleccionar Docente de la Facultad</label>
        <select v-model="form.selectedTeacherId" @change="handleSelectExistingTeacher">
          <option v-for="t in modalUnitTeachers" :key="t.id" :value="t.id">
            {{ t.fullName }} (CC {{ t.documentId }})
          </option>
        </select>
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Cédula del Docente (Autocompleta Facultad y Nombre)</label>
        <input
          v-model="form.documentId"
          type="text"
          placeholder="Digita la cédula del profesor…"
          @input="handleDocumentIdLookup"
        />
      </div>
      <div class="field">
        <label>Nombre del Docente</label>
        <input v-model="form.teacherName" type="text" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Código SAC de Investigación</label>
        <select v-model="form.code">
          <option value="10336">10336 - Proyectos de Investigación</option>
          <option value="10226">10226 - Investigador Escalafonado SICDDI</option>
          <option value="10318">10318 - Líder Grupo de Investigación</option>
          <option value="10384">10384 - Coordinador de Investigación Facultad</option>
          <option value="10225">10225 - Centro CEDETS</option>
          <option value="S/C-CITECDES">S/C-CITECDES - Centro CITECDES</option>
          <option value="10340">10340 - Editor Revista Científica</option>
        </select>
      </div>

      <div v-if="form.code === '10226'" class="field">
        <label>Subnivel SICDDI (Acuerdo 3 - Horas Fijas)</label>
        <select v-model="form.sicddiLevel">
          <option value="Nivel I (20h)">Nivel I — 20 h/mes fijas</option>
          <option value="Nivel II (80h)">Nivel II — 80 h/mes fijas</option>
          <option value="Nivel III (136h)">Nivel III — 136 h/mes fijas</option>
        </select>
      </div>
      <div v-else class="field">
        <label>Horas al Mes Aprobadas</label>
        <input v-model.number="form.monthlyHours" type="number" min="1" max="136" />
      </div>
    </div>

    <div class="field">
      <label>Nombre del Proyecto / Grupo / Estrategia</label>
      <input
        v-model="form.projectOrGroup"
        type="text"
        placeholder="Ej: Código FODEIN 2026 - Optimización energética…"
      />
    </div>

    <template #footer>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSubmit">
        Guardar y Precargar en Prenómina
      </button>
    </template>
  </UstaModal>
</template>
