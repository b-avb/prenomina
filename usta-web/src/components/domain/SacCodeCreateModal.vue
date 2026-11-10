<script setup lang="ts">
import { ref } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import UstaUnitMultiSelect from '@/components/ui/UstaUnitMultiSelect.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { SacCode } from '@usta/domain';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();

const form = ref<SacCode>({
  code: '',
  name: '',
  substantiveFunction: 'Enseñanza-Aprendizaje',
  definition: '',
  guideline: '',
  baseHours: 4,
  capHours: 20,
  requiresViceRectorApproval: false,
  appliesTo: 'Todas las unidades académicas',
  severity: 'justifiable_alert',
  facultyRules: [],
});

async function handleSave() {
  if (!form.value.code.trim() || !form.value.name.trim()) {
    store.showToast('Debes ingresar el código SAC y el nombre de la actividad', 'error');
    return;
  }
  const res = await store.createSacCode({
    ...form.value,
    code: form.value.code.trim().toUpperCase(),
    name: form.value.name.trim().toUpperCase(),
    definition: form.value.definition.trim() || form.value.guideline.trim(),
  });
  if (res.ok) {
    form.value = {
      code: '',
      name: '',
      substantiveFunction: 'Enseñanza-Aprendizaje',
      definition: '',
      guideline: '',
      baseHours: 4,
      capHours: 20,
      requiresViceRectorApproval: false,
      appliesTo: 'Todas las unidades académicas',
      severity: 'justifiable_alert',
      facultyRules: [],
    };
    emit('close');
  }
}
</script>

<template>
  <UstaModal
    :open="open"
    title="Registrar Nuevo Código SAC y Reglas (RF-02)"
    subtitle="Permite incorporar nuevas actividades académicas, describir su alcance y fijar sus topes y severidad."
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Código SAC</label>
        <input v-model="form.code" type="text" placeholder="Ej: 10418" />
      </div>
      <div class="field">
        <label>Función Sustantiva</label>
        <select v-model="form.substantiveFunction">
          <option value="Enseñanza-Aprendizaje">Enseñanza-Aprendizaje</option>
          <option value="Proyección Social">Proyección Social</option>
          <option value="Investigación">Investigación</option>
          <option value="Gestión Académica">Gestión Académica</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>Nombre de la Actividad</label>
      <input
        v-model="form.name"
        type="text"
        placeholder="Ej: TUNJA CENTRO DE INNOVACIÓN CITECDES"
      />
    </div>

    <div class="field">
      <label>Descripción / Definición de la Actividad</label>
      <textarea
        v-model="form.definition"
        rows="4"
        placeholder="Describe en qué consiste la función o actividad docente…"
      ></textarea>
    </div>

    <div class="grid cols-3" style="gap: 10px">
      <div class="field">
        <label>Base Horas (Mínimo)</label>
        <input v-model.number="form.baseHours" type="number" min="0" max="240" />
      </div>
      <div class="field">
        <label>Tope Horas (Máximo)</label>
        <input v-model.number="form.capHours" type="number" min="1" max="240" />
      </div>
      <div class="field">
        <label>Comportamiento del Tope</label>
        <select v-model="form.severity">
          <option value="blocking">Bloqueante</option>
          <option value="justifiable_alert">Excepción con justificación</option>
          <option value="informative">Informativa</option>
        </select>
      </div>
    </div>

    <div class="grid cols-2" style="gap: 10px; align-items: center">
      <UstaUnitMultiSelect v-model="form.appliesTo" :units="store.units" />
      <label class="toggle" style="margin-top: 14px">
        <input v-model="form.requiresViceRectorApproval" type="checkbox" />
        <span class="toggle__track"></span>
        <span style="font-size: 12px; font-weight: 700">
          Requiere Pre-Aval del Padre (ANEXO 3)
        </span>
      </label>
    </div>

    <div class="field">
      <label>Lineamiento y Regla de Validación (Visible para el Decano)</label>
      <textarea
        v-model="form.guideline"
        rows="4"
        placeholder="Condiciones de asignación, actas requeridas o topes especiales…"
      ></textarea>
    </div>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">Crear Código SAC</button>
    </template>
  </UstaModal>
</template>
