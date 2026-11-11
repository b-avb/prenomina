<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  AcademicOrganizationDomain,
  type AcademicUnitSummary,
} from '@usta/domain';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';

const props = defineProps<{
  open: boolean;
  initialUnit?: AcademicUnitSummary | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();
const usernameManuallyEdited = ref(false);

const form = ref({
  unitId: '',
  deanName: '',
  username: '',
  temporaryPassword: '',
  documentId: '',
  rank: 'Decano(a) de Facultad',
  education: '',
  expectedWorkload: 210,
});

function populateFromUnit(unit: AcademicUnitSummary) {
  const executiveTeacher = store.teachers.find(
    (t) => t.unitId === unit.id && t.dedication === 'DIRECTIVO',
  );
  const existingUser = store.usersDirectory.find((u) => u.unitId === unit.id);
  usernameManuallyEdited.value = false;
  form.value = {
    unitId: unit.id,
    deanName: unit.deanName,
    username:
      existingUser?.username ??
      AcademicOrganizationDomain.deriveUsernameFromFullName(unit.deanName),
    temporaryPassword: '',
    documentId: executiveTeacher?.documentId ?? '',
    rank:
      executiveTeacher?.rank ??
      (unit.unitType === 'Facultad' ? 'Decano(a) de Facultad' : 'Director(a) de Unidad'),
    education: executiveTeacher?.education ?? `Magíster · ${unit.name}`,
    expectedWorkload: executiveTeacher?.expectedWorkload ?? 210,
  };
}

watch(
  () => [props.open, props.initialUnit] as const,
  ([isOpen, unit]) => {
    if (isOpen) {
      const target = unit ?? store.units[0];
      if (target) populateFromUnit(target);
    }
  },
  { immediate: true },
);

watch(
  () => form.value.deanName,
  (newName) => {
    const unit = store.units.find((u) => u.id === form.value.unitId);
    if (!usernameManuallyEdited.value && unit && newName.trim() !== unit.deanName) {
      form.value.username = newName.trim()
        ? AcademicOrganizationDomain.deriveUsernameFromFullName(newName)
        : '';
    }
  },
);

function handleUnitChange() {
  const unit = store.units.find((u) => u.id === form.value.unitId);
  if (unit) populateFromUnit(unit);
}

function handleSave() {
  if (!form.value.deanName.trim()) {
    store.showToast('Debes ingresar el nombre completo del Decano(a) o Director(a)', 'error');
    return;
  }
  void store.updateUnitDean({
    unitId: form.value.unitId,
    deanName: form.value.deanName.trim(),
    username: form.value.username.trim() || undefined,
    temporaryPassword: form.value.temporaryPassword.trim() || undefined,
    documentId: form.value.documentId.trim(),
    rank: form.value.rank.trim(),
    education: form.value.education.trim(),
    expectedWorkload: form.value.expectedWorkload,
  });
  emit('close');
}
</script>

<template>
  <UstaModal
    :open="open"
    title="Asignar o Actualizar Decano(a) / Director(a) de Unidad"
    subtitle="Actualiza el titular de la Decanatura o Dirección Académica, sincroniza su ficha directiva en la prenómina y su cuenta de usuario institucional."
    @close="emit('close')"
  >
    <div class="field">
      <label>Facultad / Unidad Académica</label>
      <select v-model="form.unitId" @change="handleUnitChange">
        <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
          {{ unit.name }} (Actual: {{ unit.deanName }})
        </option>
      </select>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Nombre Completo del Decano(a) / Director(a)</label>
        <input
          v-model="form.deanName"
          type="text"
          placeholder="Ej: Ing. Juan Camilo Ernesto Valderrama Balaguera"
        />
      </div>
      <div class="field">
        <label>Documento / Cédula</label>
        <input v-model="form.documentId" type="text" placeholder="Ej: 74382158" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Usuario de Acceso (solo nombre de usuario)</label>
        <input
          v-model="form.username"
          type="text"
          placeholder="Ej: juan.valderrama"
          style="font-family: var(--font-mono); font-weight: 700"
          @input="usernameManuallyEdited = true"
        />
      </div>
      <div class="field">
        <label>Nueva Contraseña Temporal (opcional para asignar o reiniciar clave)</label>
        <input
          v-model="form.temporaryPassword"
          type="text"
          placeholder="Dejar vacío o ingresar cédula / clave temporal"
          style="font-family: var(--font-mono)"
        />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Cargo / Escalafón Directivo</label>
        <input v-model="form.rank" type="text" placeholder="Ej: Decano(a) de Facultad" />
      </div>
      <div class="field">
        <label>Carga Mensual Directiva (h/mes)</label>
        <input
          v-model.number="form.expectedWorkload"
          type="number"
          min="160"
          max="240"
          step="10"
        />
      </div>
    </div>

    <div class="field">
      <label>Formación Académica (Pregrado y Posgrados)</label>
      <input
        v-model="form.education"
        type="text"
        placeholder="Ej: Ingeniera Industrial · Magíster en Administración"
      />
    </div>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">Guardar Decano(a) y Usuario</button>
    </template>
  </UstaModal>
</template>
