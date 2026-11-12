<script setup lang="ts">
import { ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { ProgramQuotaAnnex5 } from '@usta/domain';

const props = defineProps<{
  open: boolean;
  defaultUnitId?: string;
  editingProgram?: ProgramQuotaAnnex5 | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();

const form = ref({
  unitId: '',
  programName: '',
  level: 'Pregrado' as ProgramQuotaAnnex5['level'],
  modality: 'Presencial' as ProgramQuotaAnnex5['modality'],
  accreditationStatus: 'Registro Calificado Vigente',
  curriculumNotes: '',
  quality30411: 16,
  curriculum40106: 16,
  sea40109: 8,
  saberPro40127: 12,
  isActive: true,
});

watch(
  () => [props.open, props.defaultUnitId, props.editingProgram] as const,
  ([isOpen, unitId, editing]) => {
    if (!isOpen) return;
    if (editing) {
      form.value = {
        unitId: editing.unitId,
        programName: editing.programName,
        level: editing.level,
        modality: editing.modality,
        accreditationStatus: editing.accreditationStatus,
        curriculumNotes: editing.curriculumNotes ?? '',
        quality30411: editing.quality30411,
        curriculum40106: editing.curriculum40106,
        sea40109: editing.sea40109,
        saberPro40127: editing.saberPro40127,
        isActive: editing.isActive,
      };
      return;
    }
    form.value = {
      unitId: unitId || store.units[0]?.id || '',
      programName: '',
      level: 'Pregrado',
      modality: 'Presencial',
      accreditationStatus: 'Registro Calificado Vigente',
      curriculumNotes: '',
      quality30411: 16,
      curriculum40106: 16,
      sea40109: 8,
      saberPro40127: 12,
      isActive: true,
    };
  },
  { immediate: true },
);

async function handleSave() {
  if (!form.value.programName.trim()) {
    store.showToast('Indique el nombre del programa académico.', 'error');
    return;
  }
  const unit = store.units.find((u) => u.id === form.value.unitId);
  if (unit && form.value.level !== 'Pregrado' && !unit.hasPostgraduates) {
    await store.updateUnit(unit.id, { hasPostgraduates: true });
  }

  if (props.editingProgram) {
    const result = await store.updateProgram(props.editingProgram.id, {
      programName: form.value.programName.trim().toUpperCase(),
      level: form.value.level,
      modality: form.value.modality,
      accreditationStatus: form.value.accreditationStatus.trim() || 'Registro Calificado Vigente',
      curriculumNotes: form.value.curriculumNotes.trim() || undefined,
      quality30411: Number(form.value.quality30411) || 0,
      curriculum40106: Number(form.value.curriculum40106) || 0,
      sea40109: Number(form.value.sea40109) || 0,
      saberPro40127: Number(form.value.saberPro40127) || 0,
      isActive: form.value.isActive,
    });
    if (result.ok) {
      store.showToast(
        `Programa "${form.value.programName.trim().toUpperCase()}" actualizado.`,
      );
      emit('close');
    }
    return;
  }

  const result = await store.createProgram({
    unitId: form.value.unitId,
    programName: form.value.programName.trim().toUpperCase(),
    level: form.value.level,
    modality: form.value.modality,
    accreditationStatus: form.value.accreditationStatus.trim() || 'Registro Calificado Vigente',
    curriculumNotes: form.value.curriculumNotes.trim() || undefined,
    quality30411: Number(form.value.quality30411) || 0,
    curriculum40106: Number(form.value.curriculum40106) || 0,
    sea40109: Number(form.value.sea40109) || 0,
    saberPro40127: Number(form.value.saberPro40127) || 0,
    isActive: form.value.isActive,
  });
  if (result.ok) {
    form.value.programName = '';
    form.value.curriculumNotes = '';
    emit('close');
  }
}
</script>

<template>
  <UstaModal
    :open="open"
    :title="
      editingProgram
        ? `Editar programa — ${editingProgram.programName}`
        : 'Nuevo programa académico'
    "
    subtitle="Defina modalidad, estado de acreditación y topes de horas del Anexo 5."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Unidad académica</label>
        <select v-model="form.unitId" :disabled="Boolean(editingProgram)">
          <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
            {{ unit.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>Nombre del programa</label>
        <input
          v-model="form.programName"
          type="text"
          placeholder="Ej.: MAESTRÍA EN INTELIGENCIA ARTIFICIAL"
        />
      </div>
    </div>

    <div class="grid cols-3" style="gap: 10px">
      <div class="field">
        <label>Nivel académico</label>
        <select v-model="form.level">
          <option value="Pregrado">Pregrado</option>
          <option value="Posgrado">Posgrado (Esp. / Maestría / Doc.)</option>
        </select>
      </div>
      <div class="field">
        <label>Modalidad</label>
        <select v-model="form.modality">
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Híbrida">Híbrida</option>
        </select>
      </div>
      <div class="field">
        <label>Estado de acreditación o registro calificado</label>
        <input v-model="form.accreditationStatus" type="text" />
      </div>
    </div>

    <div class="grid cols-4" style="gap: 8px">
      <div class="field">
        <label>30411 Calidad (h)</label>
        <input v-model.number="form.quality30411" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>40106 Currículo (h)</label>
        <input v-model.number="form.curriculum40106" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>40109 SEA (h)</label>
        <input v-model.number="form.sea40109" type="number" min="0" step="4" />
      </div>
      <div class="field">
        <label>40127 Saber Pro (h)</label>
        <input v-model.number="form.saberPro40127" type="number" min="0" step="4" />
      </div>
    </div>

    <div class="grid cols-2" style="align-items: center">
      <div class="field">
        <label>Observación curricular</label>
        <input
          v-model="form.curriculumNotes"
          type="text"
          placeholder="Ej.: Cohorte activa 2026-2"
        />
      </div>
      <label class="toggle" style="margin-top: 14px">
        <input v-model="form.isActive" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">
          Cohorte activa (suma a la bolsa de la unidad)
        </span>
      </label>
    </div>

    <template #actions>
      <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn primary" @click="handleSave">
        {{ editingProgram ? 'Guardar cambios' : 'Crear programa' }}
      </button>
    </template>
  </UstaModal>
</template>
