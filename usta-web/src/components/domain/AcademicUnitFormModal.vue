<script setup lang="ts">
/**
 * Modal form for registering an academic unit, deriving its Dean's institutional username,
 * optionally seeding an initial Annex 5 program, and emitting one-time temporary credentials.
 */
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

const OFFICIAL_DIVISIONS = [
  'División de Ingenierías y Arquitectura',
  'División de Ciencias Económicas y Administrativas',
  'División de Ciencias Jurídicas y Políticas',
  'División de Ciencias de la Salud',
  'División de Ciencias Sociales y de la Educación',
  'Direcciones Académicas Transversales',
];

const form = ref({
  name: '',
  division: 'División de Ingenierías y Arquitectura',
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
      'Indique el nombre de la unidad académica y del titular de la decanatura o dirección.',
      'error',
    );
    return;
  }

  const explicitTempPassword = form.value.temporaryPassword.trim() || undefined;

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

  if (createdRes.data.temporaryPassword && createdRes.data.deanUser) {
    emit('issuedCredentials', {
      title: 'Credenciales de acceso emitidas',
      fullName: createdUnit.deanName,
      unitName: createdUnit.name,
      username: createdRes.data.deanUser.username,
      temporaryPassword: createdRes.data.temporaryPassword,
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
    title="Nueva unidad académica"
    subtitle="Registra la unidad, su decanatura o dirección y su cuenta institucional."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Nombre de la unidad académica</label>
        <input v-model="form.name" type="text" placeholder="Nombre oficial de la unidad" />
      </div>
      <div class="field">
        <label>División académica (Acuerdo 48 de 2025)</label>
        <input
          v-model="form.division"
          type="text"
          list="official-divisions-list"
          placeholder="División académica"
        />
        <datalist id="official-divisions-list">
          <option v-for="div in OFFICIAL_DIVISIONS" :key="div" :value="div" />
        </datalist>
      </div>
    </div>

    <div class="grid cols-2">
      <div class="field">
        <label>Titular de la decanatura o dirección</label>
        <input
          v-model="form.deanName"
          type="text"
          placeholder="Nombre completo del titular"
        />
      </div>
      <div class="field">
        <label>Documento de identidad</label>
        <input v-model="form.deanDocumentId" type="text" placeholder="Número de documento" />
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
        <label>Contraseña temporal (opcional)</label>
        <input
          v-model="form.temporaryPassword"
          type="text"
          placeholder="Vacío para generar automáticamente"
        />
      </div>
    </div>

    <div class="grid cols-2" style="align-items: center">
      <div class="field">
        <label>Programa académico inicial (opcional)</label>
        <input
          v-model="form.initialProgramName"
          type="text"
          placeholder="Ej.: INGENIERÍA BIOMÉDICA"
        />
      </div>
      <label class="toggle" style="margin-top: 14px">
        <input v-model="form.hasPostgraduates" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">Cuenta con posgrados activos</span>
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
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" @click="handleSave">Crear unidad</button>
    </template>
  </UstaModal>
</template>
