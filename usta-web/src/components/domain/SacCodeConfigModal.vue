<script setup lang="ts">
import { ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import UstaUnitMultiSelect from '@/components/ui/UstaUnitMultiSelect.vue';
import { usePayrollStore } from '@/stores/payroll.store';
import type { SacCode } from '@usta/domain';

const props = defineProps<{
  codeItem: SacCode | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();

const draft = ref<SacCode | null>(null);

const newFacultyRule = ref<{
  unitId: string;
  minTeacherHours: number | null;
  maxTeacherHours: number | null;
  facultyBagCap: number | null;
}>({
  unitId: '',
  minTeacherHours: 12,
  maxTeacherHours: 16,
  facultyBagCap: null,
});

watch(
  () => props.codeItem,
  (item) => {
    draft.value = item ? structuredClone(item) : null;
    if (item && !newFacultyRule.value.unitId) {
      newFacultyRule.value.unitId = store.units[0]?.id ?? '';
    }
  },
  { immediate: true },
);

function addFacultyRuleToCode() {
  if (!draft.value) return;
  const unit = store.units.find((u) => u.id === newFacultyRule.value.unitId);
  if (!unit) return;
  if (!draft.value.facultyRules) {
    draft.value.facultyRules = [];
  }
  const existingIndex = draft.value.facultyRules.findIndex((r) => r.unitId === unit.id);
  const rule = {
    unitId: unit.id,
    unitName: unit.name,
    minTeacherHours: newFacultyRule.value.minTeacherHours,
    maxTeacherHours: newFacultyRule.value.maxTeacherHours,
    facultyBagCap: newFacultyRule.value.facultyBagCap,
  };
  if (existingIndex >= 0) {
    draft.value.facultyRules[existingIndex] = rule;
  } else {
    draft.value.facultyRules.push(rule);
  }
  store.showToast(
    `Regla específica preparada para ${unit.name} en código ${draft.value.code}`,
  );
}

function removeFacultyRuleFromCode(unitId: string) {
  if (!draft.value || !draft.value.facultyRules) return;
  draft.value.facultyRules = draft.value.facultyRules.filter(
    (r) => r.unitId !== unitId,
  );
}

async function handleSave() {
  if (!draft.value) return;
  const { code, ...patch } = draft.value;
  const res = await store.updateSacCode(code, patch);
  if (res.ok) {
    store.showToast('Regla actualizada en el catálogo ANEXO 4');
    emit('close');
  }
}

async function handleDelete() {
  if (!draft.value) return;
  const res = await store.deleteSacCode(draft.value.code);
  if (res.ok) {
    emit('close');
  }
}
</script>

<template>
  <UstaModal
    :open="!!draft"
    :title="draft ? `Configurar Código SAC ${draft.code} y Reglas de Validación` : ''"
    :subtitle="draft?.name"
    max-width="780px"
    @close="emit('close')"
  >
    <template v-if="draft">
      <div class="grid cols-2">
        <div class="field">
          <label>Nombre de la Actividad</label>
          <input v-model="draft.name" type="text" />
        </div>
        <div class="field">
          <label>Función Sustantiva</label>
          <select v-model="draft.substantiveFunction">
            <option value="Enseñanza-Aprendizaje">Enseñanza-Aprendizaje</option>
            <option value="Proyección Social">Proyección Social</option>
            <option value="Investigación">Investigación</option>
            <option value="Gestión Académica">Gestión Académica</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Descripción / Definición de la Actividad (ANEXO 4)</label>
        <textarea v-model="draft.definition" rows="3"></textarea>
      </div>
      <div class="field">
        <label>Lineamiento y Regla de Validación (Visible para el Decano al asignar)</label>
        <textarea v-model="draft.guideline" rows="3"></textarea>
      </div>

      <div class="grid cols-3" style="gap: 10px">
        <div class="field">
          <label>Base Horas (Mínimo General)</label>
          <input v-model.number="draft.baseHours" type="number" min="0" max="240" />
        </div>
        <div class="field">
          <label>Tope Horas (Máximo General)</label>
          <input v-model.number="draft.capHours" type="number" min="0" max="240" />
        </div>
        <div class="field">
          <label>Tope si tiene Posgrado (Opcional)</label>
          <input
            v-model.number="draft.postgraduateCapHours"
            type="number"
            min="0"
            max="240"
          />
        </div>
      </div>

      <div class="grid cols-2" style="gap: 10px">
        <div class="field">
          <label>Comportamiento si el Decano supera el tope (RF-07)</label>
          <select v-model="draft.severity">
            <option value="blocking">Bloqueante (No dejar pasar sin ajuste)</option>
            <option value="justifiable_alert">
              Confirmación de Excepción (Permitir con justificación escrita)
            </option>
            <option value="informative">Informativa (Aviso preventivo)</option>
          </select>
        </div>
        <UstaUnitMultiSelect v-model="draft.appliesTo" :units="store.units" />
      </div>

      <!-- FACULTY-SPECIFIC RULES -->
      <div
        style="background: var(--surface-soft); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-top: 6px"
      >
        <div style="font-size: 12px; font-weight: 800; color: var(--navy); margin-bottom: 4px">
          🎯 Reglas de Rango Específicas por Facultad (Ej: "Sistemas entre 12 y 16 h, Civil entre 16 y 20 h")
        </div>
        <p style="font-size: 11px; color: var(--ink-soft); margin: 0 0 10px">
          Permite definir un mínimo, máximo o bolsa exclusiva para una facultad determinada en este código SAC.
        </p>

        <div
          style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.7fr 0.8fr auto; gap: 8px; align-items: end"
        >
          <div>
            <label
              style="font-size: 10.5px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 3px"
            >
              Facultad / Unidad
            </label>
            <select
              v-model="newFacultyRule.unitId"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-size: 11.5px"
            >
              <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>
          <div>
            <label
              style="font-size: 10.5px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 3px"
            >
              Mín. Docente (h)
            </label>
            <input
              v-model.number="newFacultyRule.minTeacherHours"
              type="number"
              min="0"
              max="240"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-size: 12px"
            />
          </div>
          <div>
            <label
              style="font-size: 10.5px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 3px"
            >
              Máx. Docente (h)
            </label>
            <input
              v-model.number="newFacultyRule.maxTeacherHours"
              type="number"
              min="0"
              max="240"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-size: 12px"
            />
          </div>
          <div>
            <label
              style="font-size: 10.5px; font-weight: 700; color: var(--ink-soft); display: block; margin-bottom: 3px"
            >
              Bolsa Fac. (Opc.)
            </label>
            <input
              v-model.number="newFacultyRule.facultyBagCap"
              type="number"
              min="0"
              max="500"
              placeholder="—"
              style="width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-size: 12px"
            />
          </div>
          <button class="btn primary small" @click="addFacultyRuleToCode">+ Fijar Regla</button>
        </div>

        <div
          v-if="draft.facultyRules && draft.facultyRules.length > 0"
          style="margin-top: 10px; display: flex; flex-direction: column; gap: 5px"
        >
          <div
            v-for="rf in draft.facultyRules"
            :key="rf.unitId"
            style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 11.5px"
          >
            <div>
              <b style="color: var(--navy)">{{ rf.unitName }}</b> · Rango Docente:
              <b style="font-family: var(--font-mono)">
                {{ rf.minTeacherHours ?? 0 }} a {{ rf.maxTeacherHours ?? '∞' }} h/mes
              </b>
              <span v-if="rf.facultyBagCap" style="margin-left: 8px; color: var(--blue)">
                · Tope Bolsa Facultad: <b>{{ rf.facultyBagCap }} h</b>
              </span>
            </div>
            <button
              class="btn danger small"
              style="padding: 2px 8px; font-size: 11px"
              @click="removeFacultyRuleFromCode(rf.unitId)"
            >
              Quitar
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <button
          v-if="draft && draft.code !== '40104' && draft.code !== '40108'"
          class="btn danger small"
          @click="handleDelete"
        >
          Eliminar Código del Catálogo
        </button>
        <div v-else></div>
        <button class="btn primary" @click="handleSave">Guardar Cambios</button>
      </div>
    </template>
  </UstaModal>
</template>
