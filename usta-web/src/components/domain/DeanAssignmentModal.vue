<script setup lang="ts">
/**
 * Modal form for updating an academic unit's Dean, executive workload profile (`DIRECTIVO`), and
 * local institutional account credentials.
 */
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
  (
    e: 'issuedCredentials',
    payload: {
      title: string;
      fullName: string;
      unitName: string;
      username: string;
      temporaryPassword: string;
    },
  ): void;
}>();

const store = usePayrollStore();
const usernameManuallyEdited = ref(false);

const form = ref({
  unitId: '',
  deanName: '',
  username: '',
  temporaryPassword: '',
  documentId: '',
  rank: 'Decanatura de Facultad',
  education: '',
  expectedWorkload: 210,
});

function populateFromUnit(unit: AcademicUnitSummary) {
  const executiveTeacher = store.teachers.find(
    (t) => t.unitId === unit.id && t.dedication === 'DIRECTIVO',
  );
  const existingUser = store.usersDirectory.find(
    (u) => u.unitId === unit.id || u.managedUnitIds?.includes(unit.id),
  );
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
      (unit.unitType === 'Facultad' ? 'Decanatura de Facultad' : 'Dirección de Unidad'),
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

async function handleSave() {
  if (!form.value.deanName.trim()) {
    store.showToast('Indique el nombre completo del titular de la unidad.', 'error');
    return;
  }
  const res = await store.updateUnitDean({
    unitId: form.value.unitId,
    deanName: form.value.deanName.trim(),
    username: form.value.username.trim() || undefined,
    temporaryPassword: form.value.temporaryPassword.trim() || undefined,
    documentId: form.value.documentId.trim(),
    rank: form.value.rank.trim(),
    education: form.value.education.trim(),
    expectedWorkload: form.value.expectedWorkload,
  });
  if (!res.ok) return;
  if (res.data.temporaryPassword && res.data.deanUser) {
    emit('issuedCredentials', {
      title: 'Credenciales de acceso emitidas',
      fullName: res.data.unit.deanName,
      unitName: res.data.unit.name,
      username: res.data.deanUser.username,
      temporaryPassword: res.data.temporaryPassword,
    });
  }
  emit('close');
}
</script>

<template>
  <UstaModal
    :open="open"
    title="Actualizar decanatura o dirección"
    subtitle="Actualiza el titular de la unidad, su perfil directivo en prenómina y su cuenta institucional."
    @close="emit('close')"
  >
    <div class="field">
      <label>Unidad académica</label>
      <select v-model="form.unitId" @change="handleUnitChange">
        <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
          {{ unit.name }} (Actual: {{ unit.deanName }})
        </option>
      </select>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Nombre completo del titular</label>
        <input
          v-model="form.deanName"
          type="text"
          placeholder="Nombre completo del titular"
        />
      </div>
      <div class="field">
        <label>Documento de identidad</label>
        <input v-model="form.documentId" type="text" placeholder="Número de documento" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Usuario institucional</label>
        <input
          v-model="form.username"
          type="text"
          placeholder="usuario.institucional"
          @input="usernameManuallyEdited = true"
        />
      </div>
      <div class="field">
        <label>Nueva contraseña temporal (opcional)</label>
        <input
          v-model="form.temporaryPassword"
          type="text"
          placeholder="Vacío para conservar la clave actual"
        />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Cargo directivo</label>
        <input v-model="form.rank" type="text" placeholder="Ej.: Decanatura de Facultad" />
      </div>
      <div class="field">
        <label>Carga mensual directiva (h/mes)</label>
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
      <label>Formación académica</label>
      <input
        v-model="form.education"
        type="text"
        placeholder="Título profesional y posgrado"
      />
    </div>

    <template #actions>
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" @click="handleSave">Guardar cambios</button>
    </template>
  </UstaModal>
</template>
