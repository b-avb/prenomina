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

function createInitialForm(): SacCode {
  return {
    code: '',
    name: '',
    substantiveFunction: 'Enseñanza-Aprendizaje',
    definition: '',
    guideline: '',
    baseHours: 4,
    capHours: 20,
    postgraduateCapHours: null,
    hoursPerUnitFactor: null,
    unitLabel: null,
    requiresViceRectorApproval: false,
    annex3Format: null,
    appliesTo: 'Todas las unidades académicas',
    severity: 'justifiable_alert',
    mandatoryInFaculty: false,
    lockedByResearch: false,
    facultyRules: [],
  };
}

const form = ref<SacCode>(createInitialForm());

function toNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num : null;
}

function toNullableText(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed === '' ? null : trimmed;
}

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
    guideline: form.value.guideline.trim(),
    baseHours: toNullableNumber(form.value.baseHours),
    capHours: toNullableNumber(form.value.capHours),
    postgraduateCapHours: toNullableNumber(form.value.postgraduateCapHours),
    hoursPerUnitFactor: toNullableNumber(form.value.hoursPerUnitFactor),
    unitLabel: toNullableText(form.value.unitLabel),
    requiresViceRectorApproval: Boolean(form.value.requiresViceRectorApproval),
    annex3Format: form.value.requiresViceRectorApproval
      ? (form.value.annex3Format || null)
      : null,
    appliesTo: form.value.appliesTo.trim() || 'Todas las unidades académicas',
    mandatoryInFaculty: Boolean(form.value.mandatoryInFaculty),
    lockedByResearch: Boolean(form.value.lockedByResearch),
  });
  if (res.ok) {
    form.value = createInitialForm();
    emit('close');
  }
}
</script>

<template>
  <UstaModal
    :open="open"
    title="Registrar Nuevo Código SAC y Reglas Normativas"
    subtitle="Permite incorporar nuevas actividades académicas al catálogo ANEXO 4, definir sus topes y configurar sus condiciones de pre-aval."
    max-width="760px"
    @close="emit('close')"
  >
    <div class="grid cols-2">
      <div class="field">
        <label>Código SAC</label>
        <input
          v-model="form.code"
          type="text"
          maxlength="20"
          placeholder="Ej: 10418"
          style="font-family: var(--font-mono); font-weight: 700"
        />
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
      <label>Nombre Oficial de la Actividad</label>
      <input
        v-model="form.name"
        type="text"
        maxlength="200"
        placeholder="Ej: TUNJA CENTRO DE INNOVACIÓN CITECDES"
      />
    </div>

    <div class="field">
      <label>Descripción / Definición de la Actividad</label>
      <textarea
        v-model="form.definition"
        rows="3"
        placeholder="Describe en qué consiste la función o actividad docente…"
      ></textarea>
    </div>

    <div class="grid cols-4" style="gap: 10px">
      <div class="field">
        <label>Base Horas (Mín.)</label>
        <input
          v-model.number="form.baseHours"
          type="number"
          min="0"
          max="240"
          placeholder="Sin mín."
        />
      </div>
      <div class="field">
        <label>Tope Horas (Máx.)</label>
        <input
          v-model.number="form.capHours"
          type="number"
          min="0"
          max="240"
          placeholder="Según aval"
        />
      </div>
      <div class="field">
        <label>Tope c/ Posgrado</label>
        <input
          v-model.number="form.postgraduateCapHours"
          type="number"
          min="0"
          max="240"
          placeholder="—"
        />
      </div>
      <div class="field">
        <label>Comportamiento</label>
        <select v-model="form.severity">
          <option value="blocking">Bloqueante</option>
          <option value="justifiable_alert">Excepción c/ justificación</option>
          <option value="informative">Informativa</option>
        </select>
      </div>
    </div>

    <div class="grid cols-2" style="gap: 10px; align-items: start">
      <UstaUnitMultiSelect v-model="form.appliesTo" :units="store.units" />
      <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 4px">
        <label class="toggle">
          <input v-model="form.requiresViceRectorApproval" type="checkbox" />
          <span class="toggle__track"></span>
          <span style="font-size: 12px; font-weight: 700">
            Requiere Pre-Aval de Vicerrectoría (ANEXO 3)
          </span>
        </label>
        <label class="toggle">
          <input v-model="form.mandatoryInFaculty" type="checkbox" />
          <span class="toggle__track"></span>
          <span style="font-size: 12px; font-weight: 700">
            Uso obligatorio en la unidad
          </span>
        </label>
        <label class="toggle">
          <input v-model="form.lockedByResearch" type="checkbox" />
          <span class="toggle__track"></span>
          <span style="font-size: 12px; font-weight: 700">
            Cargue exclusivo Investigación (ANEXO 7)
          </span>
        </label>
      </div>
    </div>

    <div class="grid cols-3" style="gap: 10px">
      <div v-if="form.requiresViceRectorApproval" class="field">
        <label>Plantilla ANEXO 3</label>
        <select v-model="form.annex3Format">
          <option :value="null">Formato General ANEXO 3</option>
          <option value="10212">10212 · Internacionalización / Movilidad</option>
          <option value="20223_20120">20223 / 20120 · Consultorio Jurídico</option>
          <option value="20222">20222 · Prácticas y Pasantías</option>
          <option value="40126">40126 · Tutoría y Consejería</option>
          <option value="40222">40222 · Proyectos Institucionales</option>
          <option value="43401">43401 · Actividades Especiales</option>
        </select>
      </div>
      <div class="field">
        <label>Factor Horas/Unidad (Opc.)</label>
        <input
          v-model.number="form.hoursPerUnitFactor"
          type="number"
          min="0"
          max="240"
          placeholder="Ej: 4"
        />
      </div>
      <div class="field">
        <label>Etiqueta Unidad (Opc.)</label>
        <input
          v-model="form.unitLabel"
          type="text"
          maxlength="80"
          placeholder="Ej: semillero, proyecto"
        />
      </div>
    </div>

    <div class="field">
      <label>Lineamiento y Regla de Validación (Visible para el Decano)</label>
      <textarea
        v-model="form.guideline"
        rows="3"
        placeholder="Condiciones de asignación, actas requeridas o topes especiales…"
      ></textarea>
    </div>

    <template #actions>
      <button class="btn ghost" @click="emit('close')">Cancelar</button>
      <button class="btn primary" @click="handleSave">Crear Código SAC</button>
    </template>
  </UstaModal>
</template>
