<script setup lang="ts">
/**
 * Modal form for creating or editing Annex 7 research allocations on career faculty (`TC`/`MT`),
 * reading active `Investigación` SAC codes dynamically from the catalog and supporting inline
 * provisioning of new or `Por definir` teachers in the target academic unit.
 */
import { computed, ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type {
  CreateResearchAllocationDto,
  ResearchAllocationAnnex7,
} from '@usta/domain';

const props = defineProps<{
  open: boolean;
  editingItem: ResearchAllocationAnnex7 | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'save',
    payload: CreateResearchAllocationDto,
    editingId: string | null,
  ): void;
}>();

const store = usePayrollStore();

const ROLE_SUGGESTIONS = [
  'Investigador principal',
  'Coinvestigador',
  'Líder de grupo de investigación',
  'Coordinador de investigación',
  'Editor de revista científica',
  'Coeditor o asistente editorial',
  'Tutor de semillero o estrategia CTeI',
  'Docente centro de investigación',
  'Integrante Comité de Ética',
] as const;

const researchSacCodes = computed(() => {
  const explicitAnnex7 = store.sacCodes.filter(
    (c) => Boolean(c.lockedByResearch) && c.code !== '10226',
  );
  if (explicitAnnex7.length > 0) return explicitAnnex7;
  return store.sacCodes.filter(
    (c) => c.substantiveFunction === 'Investigación' && c.code !== '10226',
  );
});

const selectedSacDef = computed(() =>
  store.sacCodes.find((c) => c.code === form.value.code),
);

const teacherMode = ref<'existing' | 'new'>('existing');
const newTeacherDedication = ref<'TC' | 'MT'>('TC');
const newTeacherProvisional = ref<boolean>(false);

const form = ref({
  unitId: '',
  selectedTeacherId: '',
  documentId: '',
  teacherName: '',
  code: '10336',
  activityName: 'DESARROLLO DE PROYECTOS DE INVESTIGACIÓN',
  projectOrGroup: '',
  role: '',
  monthlyHours: 16,
  notes: '',
});

const modalUnitTeachers = computed(() =>
  store.teachers.filter(
    (t) => t.unitId === form.value.unitId && t.dedication !== 'CATEDRA',
  ),
);

function buildNextProvisionalDocId(): string {
  const existingCount = store.teachers.filter((t) =>
    t.documentId.startsWith('POR-DEFINIR-INV-'),
  ).length;
  return `POR-DEFINIR-INV-${String(existingCount + 1).padStart(2, '0')}`;
}

function resetFormForCreate() {
  const defaultUnitId = store.units[0]?.id ?? '';
  const unitTeachers = store.teachers.filter(
    (t) => t.unitId === defaultUnitId && t.dedication !== 'CATEDRA',
  );
  const firstTeacher = unitTeachers[0];
  const defaultCode = researchSacCodes.value[0]?.code ?? '10336';
  const defaultCodeDef = store.sacCodes.find((c) => c.code === defaultCode);

  teacherMode.value = firstTeacher ? 'existing' : 'new';
  newTeacherDedication.value = 'TC';
  newTeacherProvisional.value = false;

  form.value = {
    unitId: defaultUnitId,
    selectedTeacherId: firstTeacher?.id ?? '',
    documentId: firstTeacher?.documentId ?? '',
    teacherName: firstTeacher?.fullName ?? '',
    code: defaultCode,
    activityName: defaultCodeDef
      ? defaultCodeDef.name.replace(/^TUNJA\s+/i, '')
      : 'Desarrollo de Proyectos de Investigación',
    projectOrGroup: '',
    role: '',
    monthlyHours: defaultCodeDef?.baseHours ?? 16,
    notes: '',
  };
}

watch(
  () => [props.open, props.editingItem] as const,
  ([isOpen, item]) => {
    if (!isOpen) return;
    if (item) {
      const teacher = store.teachers.find(
        (t) => t.documentId === item.documentId && t.unitId === item.unitId,
      );
      teacherMode.value = 'existing';
      newTeacherDedication.value = 'TC';
      newTeacherProvisional.value = Boolean(teacher?.isProvisional);
      form.value = {
        unitId: item.unitId,
        selectedTeacherId: teacher?.id ?? '',
        documentId: item.documentId,
        teacherName: item.teacherName,
        code: item.code,
        activityName: item.activityName,
        projectOrGroup: item.projectOrGroup,
        role: item.role && item.role !== '—' ? item.role : '',
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
    if (props.editingItem || teacherMode.value === 'new') return;
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
  () => form.value.code,
  () => {
    const def = store.sacCodes.find((c) => c.code === form.value.code);
    if (def) {
      form.value.activityName = def.name.replace(/^TUNJA\s+/i, '');
    }
  },
);

function setTeacherMode(mode: 'existing' | 'new'): void {
  teacherMode.value = mode;
  if (mode === 'existing') {
    const first = modalUnitTeachers.value[0];
    form.value.selectedTeacherId = first?.id ?? '';
    form.value.documentId = first?.documentId ?? '';
    form.value.teacherName = first?.fullName ?? '';
  } else {
    form.value.selectedTeacherId = '';
    form.value.documentId = newTeacherProvisional.value
      ? buildNextProvisionalDocId()
      : '';
    form.value.teacherName = newTeacherProvisional.value
      ? 'DOCENTE POR DEFINIR INVESTIGACIÓN'
      : '';
  }
}

function handleToggleProvisional(): void {
  if (newTeacherProvisional.value) {
    if (!form.value.documentId.trim()) {
      form.value.documentId = buildNextProvisionalDocId();
    }
    if (!form.value.teacherName.trim()) {
      form.value.teacherName = 'DOCENTE POR DEFINIR INVESTIGACIÓN';
    }
  }
}

function handleSelectExistingTeacher(event: Event): void {
  const id = (event.target as HTMLSelectElement).value;
  const teacher = store.teachers.find((t) => t.id === id);
  if (teacher) {
    form.value.documentId = teacher.documentId;
    form.value.teacherName = teacher.fullName;
  }
}

function handleDocumentIdLookup(): void {
  if (teacherMode.value === 'new') return;
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
  const resolvedDocId =
    form.value.documentId.trim() ||
    (teacherMode.value === 'new' && newTeacherProvisional.value
      ? buildNextProvisionalDocId()
      : '');
  const resolvedName =
    form.value.teacherName.trim() ||
    (teacherMode.value === 'new' && newTeacherProvisional.value
      ? 'DOCENTE POR DEFINIR INVESTIGACIÓN'
      : '');

  if (!resolvedDocId || !resolvedName) {
    store.showToast('Seleccione un docente o indique su cédula y nombre.', 'error');
    return;
  }
  const matchedTeacher = store.teachers.find(
    (t) => t.documentId === resolvedDocId && t.unitId === form.value.unitId,
  );
  if (matchedTeacher?.dedication === 'CATEDRA') {
    store.showToast(
      'No se permite asignar horas de investigación (Anexo 7) a docentes de cátedra.',
      'error',
    );
    return;
  }
  const unit = store.units.find((u) => u.id === form.value.unitId);
  const def = store.sacCodes.find((c) => c.code === form.value.code);

  emit(
    'save',
    {
      unitId: form.value.unitId,
      unitName: unit?.name ?? '',
      documentId: resolvedDocId,
      teacherName: resolvedName.toUpperCase(),
      code: form.value.code,
      activityName: def
        ? def.name.replace(/^TUNJA\s+/i, '')
        : form.value.activityName,
      projectOrGroup:
        form.value.projectOrGroup.trim() ||
        `Asignación ${form.value.code} (${store.activePeriod})`,
      role: form.value.role.trim(),
      sicddiLevel: null,
      weeklyHours: Math.round((form.value.monthlyHours / 4) * 10) / 10,
      monthlyHours: form.value.monthlyHours,
      isSicddiLocked: Boolean(def?.lockedByResearch),
      notes: form.value.notes.trim(),
      ...(teacherMode.value === 'new' && !matchedTeacher
        ? {
            teacherDedication: newTeacherDedication.value,
            isProvisional: newTeacherProvisional.value,
          }
        : {}),
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
    subtitle="Seleccione un docente de planta o registre un nuevo docente o vacante por definir en la unidad."
    max-width="660px"
    @close="emit('close')"
  >
    <div
      v-if="!editingItem"
      style="display: flex; gap: 6px; margin-bottom: 12px"
    >
      <button
        type="button"
        class="dia-chip"
        style="height: 30px; font-size: 12px"
        :class="{ active: teacherMode === 'existing' }"
        @click="setTeacherMode('existing')"
      >
        Docente en planta de la unidad
      </button>
      <button
        type="button"
        class="dia-chip"
        style="height: 30px; font-size: 12px"
        :class="{ active: teacherMode === 'new' }"
        @click="setTeacherMode('new')"
      >
        Nuevo docente o vacante por definir
      </button>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Unidad académica</label>
        <select v-model="form.unitId">
          <option v-for="u in store.units" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>

      <div v-if="teacherMode === 'existing'" class="field">
        <label>Docente de planta</label>
        <select v-model="form.selectedTeacherId" @change="handleSelectExistingTeacher">
          <option v-if="modalUnitTeachers.length === 0" value="">
            Sin docentes registrados en esta unidad
          </option>
          <option v-for="t in modalUnitTeachers" :key="t.id" :value="t.id">
            {{ t.fullName }} ({{ t.dedication }} · CC {{ t.documentId }})
          </option>
        </select>
      </div>

      <div v-else class="field">
        <label>Dedicación del nuevo docente</label>
        <select v-model="newTeacherDedication">
          <option value="TC">Tiempo Completo (160 h/mes)</option>
          <option value="MT">Medio Tiempo (80 h/mes)</option>
        </select>
      </div>
    </div>

    <label
      v-if="teacherMode === 'new' && !editingItem"
      class="toggle"
      style="margin: 2px 0 10px; padding: 8px 12px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 8px"
    >
      <input
        v-model="newTeacherProvisional"
        type="checkbox"
        @change="handleToggleProvisional"
      />
      <span class="toggle__track"></span>
      <span style="font-size: 12px; font-weight: 700; color: var(--navy)">
        Vacante o docente por definir (genera identificador provisional si aún no tiene cédula)
      </span>
    </label>

    <div class="grid cols-2">
      <div class="field">
        <label>
          {{
            teacherMode === 'new' && newTeacherProvisional
              ? 'Código provisional o cédula'
              : 'Cédula del docente'
          }}
        </label>
        <input
          v-model="form.documentId"
          type="text"
          :placeholder="
            teacherMode === 'new'
              ? 'Número de documento o código de vacante…'
              : 'Buscar por número de cédula…'
          "
          @input="handleDocumentIdLookup"
        />
      </div>
      <div class="field">
        <label>Nombre del docente (o etiqueta por definir)</label>
        <input
          v-model="form.teacherName"
          type="text"
          placeholder="Ej. DOCENTE POR DEFINIR INVESTIGACIÓN"
        />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Código SAC de investigación</label>
        <select v-model="form.code">
          <option v-for="c in researchSacCodes" :key="c.code" :value="c.code">
            {{ c.code }} — {{ c.name.replace(/^TUNJA\s+/i, '') }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>
          Horas aprobadas al mes
          <span
            v-if="selectedSacDef && (selectedSacDef.baseHours !== null || selectedSacDef.capHours !== null)"
            style="font-weight: 500; color: var(--ink-soft)"
          >
            ({{ selectedSacDef.baseHours ?? 0 }}–{{ selectedSacDef.capHours ?? 160 }} h)
          </span>
        </label>
        <input
          v-model.number="form.monthlyHours"
          type="number"
          min="1"
          :max="selectedSacDef?.capHours ?? 160"
        />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Rol en la actividad (opcional)</label>
        <input
          v-model="form.role"
          type="text"
          list="research-role-options"
          placeholder="Ej. Investigador principal, Coinvestigador, Líder de grupo…"
        />
        <datalist id="research-role-options">
          <option v-for="opt in ROLE_SUGGESTIONS" :key="opt" :value="opt" />
        </datalist>
      </div>

      <div class="field">
        <label>Proyecto, grupo o estrategia</label>
        <input
          v-model="form.projectOrGroup"
          type="text"
          placeholder="Código de convocatoria, proyecto, revista o grupo…"
        />
      </div>
    </div>

    <div class="field">
      <label>Observaciones (opcional)</label>
      <input
        v-model="form.notes"
        type="text"
        placeholder="Detalle de acta, convocatoria o aval…"
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
