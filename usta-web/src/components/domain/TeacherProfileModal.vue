<script setup lang="ts">
/**
 * Modal form for creating or editing a faculty teacher or provisional vacancy, including contract
 * dedication, academic rank, and cross-unit shared hours.
 */
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
    store.showToast('Indique el nombre del docente o la denominación de la vacante.', 'error');
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
        ? 'Editar perfil del docente'
        : 'Registrar docente o vacante'
    "
    subtitle="Datos contractuales, dedicación y horas compartidas con otras unidades."
    @close="emit('close')"
  >
    <label
      class="toggle"
      style="margin-bottom: 16px; padding: 10px 14px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px"
    >
      <input v-model="form.isProvisional" type="checkbox" />
      <span class="toggle__track"></span>
      <span style="font-size: 12.5px; font-weight: 700; color: var(--navy)">
        Vacante provisional por definir
      </span>
    </label>

    <div style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 14px">
      <div class="field">
        <label>Documento de identidad</label>
        <input
          v-model="form.documentId"
          type="text"
          :placeholder="form.isProvisional ? 'Código automático de vacante' : 'Número sin puntos ni espacios'"
        />
      </div>
      <div class="field">
        <label>Dedicación contractual</label>
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
      <label>Nombre completo o denominación de la vacante</label>
      <input
        v-model="form.fullName"
        type="text"
        placeholder="Ej.: DOCENTE NUEVO — ÁREA PRODUCCIÓN"
      />
    </div>

    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px">
      <div class="field">
        <label>Categoría en escalafón</label>
        <select v-model="form.rank">
          <option value="Categoría 1 (Auxiliar)">Categoría 1 (Auxiliar)</option>
          <option value="Categoría 2 (Asistente)">Categoría 2 (Asistente)</option>
          <option value="Categoría 3 (Asociado)">Categoría 3 (Asociado)</option>
          <option value="Categoría 4 (Titular)">Categoría 4 (Titular)</option>
          <option value="Sin Escalafón / Cátedra">Sin Escalafón / Cátedra</option>
        </select>
      </div>
      <div class="field">
        <label>Carga mensual esperada (h)</label>
        <input v-model.number="form.expectedWorkload" type="number" min="8" max="240" />
      </div>
    </div>

    <div class="field">
      <label>Formación académica</label>
      <input
        v-model="form.education"
        type="text"
        placeholder="Ej.: Ingeniero Industrial · Magíster en Ingeniería"
      />
    </div>

    <div
      style="background: var(--surface-soft); padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 18px"
    >
      <b style="font-size: 12px; color: var(--navy); display: block; margin-bottom: 10px">
        Horas compartidas con otra unidad académica
      </b>
      <div style="display: grid; grid-template-columns: 175px 1fr; gap: 14px">
        <div class="field" style="margin-bottom: 0">
          <label>Horas compartidas al mes</label>
          <input v-model.number="form.sharedHours" type="number" min="0" max="160" />
        </div>
        <div class="field" style="margin-bottom: 0">
          <label>Unidad con la que comparte</label>
          <input
            v-model="form.sharedUnitName"
            type="text"
            list="shared-units-list"
            placeholder="Ej.: POSGRADOS"
          />
          <datalist id="shared-units-list">
            <option value="POSGRADOS" />
            <option value="DIRECCIÓN DE HUMANIDADES" />
            <option value="DIRECCIÓN DE CIENCIAS BÁSICAS" />
            <option value="CILCE" />
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
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" @click="handleSave">
        {{ editingTeacher ? 'Guardar cambios' : 'Registrar docente' }}
      </button>
    </template>
  </UstaModal>
</template>
