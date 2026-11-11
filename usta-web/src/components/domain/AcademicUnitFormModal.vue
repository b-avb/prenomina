<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  AcademicOrganizationDomain,
} from '@usta/domain';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();
const usernameManuallyEdited = ref(false);

const form = ref({
  name: '',
  division: 'División de Arquitectura e Ingenierías',
  unitType: 'Facultad' as 'Facultad' | 'Dirección Académica',
  deanName: '',
  username: '',
  temporaryPassword: '',
  deanDocumentId: '',
  deanEducation: '',
  hasPostgraduates: true,
  initialProgramName: '',
  qualityCap30411: 24,
  curriculumCap40106: 20,
  seaCap40109: 8,
  saberProCap40127: 12,
  graduatesCap20502: 12,
});

watch(
  () => form.value.deanName,
  (newName) => {
    if (!usernameManuallyEdited.value) {
      form.value.username = newName.trim()
        ? AcademicOrganizationDomain.deriveUsernameFromFullName(newName)
        : '';
    }
  },
);

async function handleSave() {
  if (!form.value.name.trim() || !form.value.deanName.trim()) {
    store.showToast(
      'Debes ingresar el nombre de la Facultad/Unidad y el nombre del Decano(a)',
      'error',
    );
    return;
  }

  const explicitTempPassword =
    form.value.temporaryPassword.trim() ||
    (form.value.deanDocumentId.trim().length >= 6
      ? form.value.deanDocumentId.trim()
      : undefined);

  const createdRes = await store.addAcademicUnit({
    name: form.value.name.trim(),
    division: form.value.division.trim(),
    unitType: form.value.unitType,
    deanName: form.value.deanName.trim(),
    username: form.value.username.trim() || undefined,
    temporaryPassword: explicitTempPassword,
    hasPostgraduates: form.value.hasPostgraduates,
    qualityCap30411: form.value.qualityCap30411,
    curriculumCap40106: form.value.curriculumCap40106,
    seaCap40109: form.value.seaCap40109,
    saberProCap40127: form.value.saberProCap40127,
    graduatesCap20502: form.value.graduatesCap20502,
  });

  if (!createdRes.ok) return;
  const createdUnit = createdRes.data.unit;

  if (form.value.deanDocumentId.trim() || form.value.deanEducation.trim()) {
    await store.updateUnitDean({
      unitId: createdUnit.id,
      deanName: form.value.deanName.trim(),
      username: form.value.username.trim() || undefined,
      documentId: form.value.deanDocumentId.trim() || undefined,
      education: form.value.deanEducation.trim() || undefined,
    });
  }
  if (form.value.initialProgramName.trim()) {
    await store.createProgram({
      unitId: createdUnit.id,
      programName: form.value.initialProgramName.trim().toUpperCase(),
      level: 'Pregrado',
      modality: 'Presencial',
      accreditationStatus: 'Registro Calificado Vigente',
      quality30411: form.value.qualityCap30411,
      curriculum40106: form.value.curriculumCap40106,
      sea40109: form.value.seaCap40109,
      saberPro40127: form.value.saberProCap40127,
      isActive: true,
    });
  }

  form.value.name = '';
  form.value.deanName = '';
  form.value.username = '';
  form.value.temporaryPassword = '';
  form.value.deanDocumentId = '';
  form.value.deanEducation = '';
  form.value.initialProgramName = '';
  usernameManuallyEdited.value = false;
  emit('close');
}
</script>

<template>
  <UstaModal
    :open="open"
    title="Crear Nueva Facultad / Unidad Académica y su Decano(a)"
    subtitle="Registra una nueva unidad académica en el consolidado seccional junto con su Decano(a) titular, su usuario de acceso y su contraseña temporal inicial."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Nombre de la Facultad o Unidad Académica</label>
        <input v-model="form.name" type="text" placeholder="Ej: Ingeniería Biomédica" />
      </div>
      <div class="field">
        <label>División Académica</label>
        <input
          v-model="form.division"
          type="text"
          placeholder="Ej: División de Arquitectura e Ingenierías"
        />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Nombre Completo del Decano(a) o Director(a)</label>
        <input
          v-model="form.deanName"
          type="text"
          placeholder="Ej: Ing. Carlos Andrés Gómez, M.Sc."
        />
      </div>
      <div class="field">
        <label>Documento / Cédula del Decano(a)</label>
        <input v-model="form.deanDocumentId" type="text" placeholder="Ej: 1053812940" />
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Usuario de Acceso (solo nombre de usuario)</label>
        <input
          v-model="form.username"
          type="text"
          placeholder="Ej: carlos.gomez"
          style="font-family: var(--font-mono); font-weight: 700"
          @input="usernameManuallyEdited = true"
        />
      </div>
      <div class="field">
        <label>Contraseña Temporal (opcional · por defecto cédula o autogenerada)</label>
        <input
          v-model="form.temporaryPassword"
          type="text"
          placeholder="Dejar vacío para usar cédula o clave aleatoria"
          style="font-family: var(--font-mono); font-weight: 700"
        />
      </div>
    </div>

    <div class="grid cols-2" style="align-items: center">
      <div class="field">
        <label>Programa Académico Inicial (Opcional)</label>
        <input
          v-model="form.initialProgramName"
          type="text"
          placeholder="Ej: INGENIERÍA BIOMÉDICA"
        />
      </div>
      <label class="toggle" style="margin-top: 14px">
        <input v-model="form.hasPostgraduates" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">Cuenta con Posgrados Activos</span>
      </label>
    </div>

    <div class="grid cols-3" style="gap: 10px">
      <div class="field">
        <label>30411 Calidad (h/mes)</label>
        <input v-model.number="form.qualityCap30411" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>40106 Currículo (h/mes)</label>
        <input v-model.number="form.curriculumCap40106" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>40109 SEA (h/mes)</label>
        <input v-model.number="form.seaCap40109" type="number" min="0" step="4" />
      </div>
    </div>

    <div class="grid cols-2" style="gap: 10px">
      <div class="field">
        <label>40127 Saber Pro (h/mes)</label>
        <input v-model.number="form.saberProCap40127" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>20502 Graduados (h/mes)</label>
        <input v-model.number="form.graduatesCap20502" type="number" min="0" step="4" />
      </div>
    </div>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">Crear Decanatura y Usuario</button>
    </template>
  </UstaModal>
</template>
