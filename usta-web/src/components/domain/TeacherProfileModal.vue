<script setup lang="ts">
import { ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { FacultyTeacher } from '@usta/domain';

const props = defineProps<{
  open: boolean;
  editingTeacher: FacultyTeacher | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', teacherId: string): void;
}>();

const store = usePayrollStore();

const form = ref({
  isProvisional: false,
  documentId: '',
  fullName: '',
  dedication: 'TC' as 'TC' | 'MT' | 'CATEDRA' | 'DIRECTIVO',
  expectedWorkload: 160,
  rank: 'Categoría 1 (Auxiliar)',
  education: '',
  sharedHours: 0,
  sharedUnitName: '',
});

watch(
  () => [props.open, props.editingTeacher] as const,
  ([isOpen, teacher]) => {
    if (!isOpen) return;
    if (teacher) {
      form.value = {
        isProvisional: teacher.isProvisional,
        documentId: teacher.documentId,
        fullName: teacher.fullName,
        dedication: teacher.dedication,
        expectedWorkload: teacher.expectedWorkload,
        rank: teacher.rank,
        education: teacher.education,
        sharedHours: teacher.sharedHours ?? 0,
        sharedUnitName: teacher.sharedUnitName ?? '',
      };
    } else {
      form.value = {
        isProvisional: false,
        documentId: '',
        fullName: '',
        dedication: 'TC',
        expectedWorkload: 160,
        rank: 'Categoría 1 (Auxiliar)',
        education: '',
        sharedHours: 0,
        sharedUnitName: '',
      };
    }
  },
  { immediate: true },
);

async function handleSave() {
  if (!form.value.fullName.trim()) {
    store.showToast('Debes ingresar el nombre del docente o etiqueta de la vacante', 'error');
    return;
  }
  if (props.editingTeacher) {
    const res = await store.updateTeacherProfile(props.editingTeacher.id, { ...form.value });
    if (!res.ok) return;
    emit('saved', props.editingTeacher.id);
  } else {
    const res = await store.addFacultyTeacher({ ...form.value });
    if (!res.ok) return;
    emit('saved', res.data.id);
  }
  emit('close');
}
</script>

<template>
  <UstaModal
    :open="open"
    :title="
      editingTeacher
        ? 'Editar Ficha del Docente y Horas Compartidas'
        : 'Registrar Docente o Vacante Provisional'
    "
    subtitle="Configura datos contractuales, dedicación y condición de horas compartidas con otras unidades (RN-17)."
    @close="emit('close')"
  >
    <label
      class="toggle"
      style="margin-bottom: 16px; padding: 10px 14px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px"
    >
      <input v-model="form.isProvisional" type="checkbox" />
      <span class="toggle__track"></span>
      <span style="font-size: 12.5px; font-weight: 700; color: var(--navy)">
        Es vacante provisional / Docente por definir (RF-10)
      </span>
    </label>

    <div style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 14px">
      <div class="field">
        <label>Documento / Cédula</label>
        <input
          v-model="form.documentId"
          type="text"
          :placeholder="form.isProvisional ? 'Automático (VACANTE)' : 'Ej: 1049625911'"
        />
      </div>
      <div class="field">
        <label>Dedicación Contractual</label>
        <select
          v-model="form.dedication"
          @change="
            form.expectedWorkload =
              form.dedication === 'TC'
                ? 160
                : form.dedication === 'MT'
                  ? 80
                  : form.dedication === 'DIRECTIVO'
                    ? 210
                    : 48
          "
        >
          <option value="TC">Tiempo Completo (160 h/mes)</option>
          <option value="MT">Medio Tiempo (80 h/mes)</option>
          <option value="CATEDRA">Cátedra (16–48 h/mes)</option>
          <option value="DIRECTIVO">Directivo / Decano (210–240 h)</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>Nombre completo o etiqueta de vacante</label>
      <input
        v-model="form.fullName"
        type="text"
        placeholder="Ej: DOCENTE NUEVO 1 - ÁREA PRODUCCIÓN"
      />
    </div>

    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px">
      <div class="field">
        <label>Categoría Escalafón</label>
        <select v-model="form.rank">
          <option value="Categoría 1 (Auxiliar)">Categoría 1 (Auxiliar)</option>
          <option value="Categoría 2 (Asistente)">Categoría 2 (Asistente)</option>
          <option value="Categoría 3 (Asociado)">Categoría 3 (Asociado)</option>
          <option value="Categoría 4 (Titular)">Categoría 4 (Titular)</option>
          <option value="Sin Escalafón / Cátedra">Sin Escalafón / Cátedra</option>
        </select>
      </div>
      <div class="field">
        <label>Carga Mensual Esperada (h)</label>
        <input v-model.number="form.expectedWorkload" type="number" min="8" max="240" />
      </div>
    </div>

    <div class="field">
      <label>Formación Académica (Pregrado y Posgrados)</label>
      <input
        v-model="form.education"
        type="text"
        placeholder="Ej: Ingeniero Industrial · Magíster en Ingeniería"
      />
    </div>

    <div
      style="background: var(--surface-soft); padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 18px"
    >
      <b style="font-size: 12px; color: var(--navy); display: block; margin-bottom: 10px">
        Condición de Docente Compartido entre Unidades Académicas (RN-17 · Columna AG)
      </b>
      <div style="display: grid; grid-template-columns: 175px 1fr; gap: 14px">
        <div class="field" style="margin-bottom: 0">
          <label>Horas compartidas / mes</label>
          <input v-model.number="form.sharedHours" type="number" min="0" max="160" />
        </div>
        <div class="field" style="margin-bottom: 0">
          <label>Facultad / Unidad con la que comparte</label>
          <input
            v-model="form.sharedUnitName"
            type="text"
            list="shared-units-list"
            placeholder="Ej: POSGRADOS / INGENIERÍA AMBIENTAL"
          />
          <datalist id="shared-units-list">
            <option value="POSGRADOS" />
            <option value="DEPARTAMENTO DE HUMANIDADES" />
            <option value="DEPARTAMENTO DE CIENCIAS BÁSICAS" />
            <option value="INSTITUTO DE LENGUAS FRAY BERNARDO DE LUGO" />
            <option
              v-for="unit in store.units"
              :key="unit.id"
              :value="unit.name.toUpperCase()"
            />
          </datalist>
        </div>
      </div>
    </div>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">
        {{ editingTeacher ? 'Guardar Cambios' : 'Registrar Docente' }}
      </button>
    </template>
  </UstaModal>
</template>
