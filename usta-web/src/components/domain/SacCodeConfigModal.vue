<script setup lang="ts">
/**
 * Modal editor for Annex 4 SAC code parameters, Annex 3 approval format bindings, per-unit hour
 * rules, and non-structural code deletion.
 */
import { computed, ref, watch } from 'vue';
import UstaModal from '@/components/ui/UstaModal.vue';
import UstaUnitMultiSelect from '@/components/ui/UstaUnitMultiSelect.vue';
import { cloneState } from '@/composables/useMutation';
import { STRUCTURAL_SAC_CODES } from '@/constants/payroll.constants';
import { usePayrollStore } from '@/stores/payroll.store';
import type { SacCode } from '@usta/domain';

const props = defineProps<{
  codeItem: SacCode | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = usePayrollStore();

const originalCode = ref<string>('');
const draft = ref<SacCode | null>(null);
const confirmingDelete = ref<boolean>(false);

const isProtectedTrunkCode = computed(() =>
  (STRUCTURAL_SAC_CODES as readonly string[]).includes(originalCode.value),
);

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

watch(
  () => props.codeItem,
  (item) => {
    confirmingDelete.value = false;
    if (item) {
      const cloned = cloneState(item);
      originalCode.value = cloned.code;
      draft.value = {
        ...cloned,
        postgraduateCapHours: cloned.postgraduateCapHours ?? null,
        psePercentage: cloned.psePercentage ?? null,
        hoursPerUnitFactor: cloned.hoursPerUnitFactor ?? null,
        unitLabel: cloned.unitLabel ?? null,
        annex3Format: cloned.annex3Format ?? null,
        mandatoryInFaculty: Boolean(cloned.mandatoryInFaculty),
        lockedByResearch: Boolean(cloned.lockedByResearch),
        facultyRules: cloned.facultyRules ? cloneState(cloned.facultyRules) : [],
      };
      if (!newFacultyRule.value.unitId) {
        newFacultyRule.value.unitId = store.units[0]?.id ?? '';
      }
    } else {
      originalCode.value = '';
      draft.value = null;
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
    minTeacherHours: toNullableNumber(newFacultyRule.value.minTeacherHours),
    maxTeacherHours: toNullableNumber(newFacultyRule.value.maxTeacherHours),
    facultyBagCap: toNullableNumber(newFacultyRule.value.facultyBagCap),
  };
  if (existingIndex >= 0) {
    draft.value.facultyRules[existingIndex] = rule;
  } else {
    draft.value.facultyRules.push(rule);
  }
  store.showToast(
    `Regla configurada para ${unit.name} en el código ${draft.value.code}.`,
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
  const targetCode = draft.value.code.trim().toUpperCase();
  if (!targetCode || !draft.value.name.trim()) {
    store.showToast('Indique el código SAC y el nombre de la actividad.', 'error');
    return;
  }

  const normalizedRules = (draft.value.facultyRules ?? []).map((rule) => ({
    unitId: rule.unitId,
    unitName: rule.unitName,
    minTeacherHours: toNullableNumber(rule.minTeacherHours),
    maxTeacherHours: toNullableNumber(rule.maxTeacherHours),
    facultyBagCap: toNullableNumber(rule.facultyBagCap),
  }));

  const res = await store.updateSacCode(originalCode.value, {
    ...(targetCode !== originalCode.value ? { newCode: targetCode } : {}),
    name: draft.value.name.trim().toUpperCase(),
    substantiveFunction: draft.value.substantiveFunction,
    definition: draft.value.definition.trim(),
    guideline: draft.value.guideline.trim(),
    baseHours: toNullableNumber(draft.value.baseHours),
    capHours: toNullableNumber(draft.value.capHours),
    postgraduateCapHours: toNullableNumber(draft.value.postgraduateCapHours),
    psePercentage:
      originalCode.value === '40108'
        ? toNullableNumber(draft.value.psePercentage)
        : null,
    hoursPerUnitFactor: toNullableNumber(draft.value.hoursPerUnitFactor),
    unitLabel: toNullableText(draft.value.unitLabel),
    requiresViceRectorApproval: Boolean(draft.value.requiresViceRectorApproval),
    annex3Format: draft.value.requiresViceRectorApproval
      ? (draft.value.annex3Format || null)
      : null,
    appliesTo: draft.value.appliesTo.trim() || 'Todas las unidades académicas',
    severity: draft.value.severity,
    mandatoryInFaculty: Boolean(draft.value.mandatoryInFaculty),
    lockedByResearch: Boolean(draft.value.lockedByResearch),
    facultyRules: normalizedRules,
  });
  if (res.ok) {
    store.showToast(`Código SAC ${res.data.code} actualizado.`);
    emit('close');
  }
}

async function handleDelete() {
  if (!draft.value || isProtectedTrunkCode.value) return;
  const res = await store.deleteSacCode(originalCode.value);
  if (res.ok) {
    emit('close');
  }
}
</script>

<template>
  <UstaModal
    :open="!!draft"
    :title="draft ? `Configurar código SAC ${originalCode}` : ''"
    :subtitle="draft?.name"
    max-width="820px"
    @close="emit('close')"
  >
    <template v-if="draft">
      <div class="grid cols-3" style="gap: 10px">
        <div class="field">
          <label>
            Código SAC
            <span v-if="isProtectedTrunkCode" style="color: var(--ink-soft); font-weight: 500">
              (estructural)
            </span>
          </label>
          <input
            v-model="draft.code"
            type="text"
            maxlength="20"
            :disabled="isProtectedTrunkCode"
          />
        </div>
        <div class="field" style="grid-column: span 2">
          <label>Función sustantiva</label>
          <select v-model="draft.substantiveFunction">
            <option value="Enseñanza-Aprendizaje">Enseñanza-Aprendizaje</option>
            <option value="Proyección Social">Proyección Social</option>
            <option value="Investigación">Investigación</option>
            <option value="Gestión Académica">Gestión Académica</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Nombre oficial de la actividad (Anexo 4)</label>
        <input v-model="draft.name" type="text" maxlength="200" />
      </div>

      <div class="field">
        <label>Descripción de la actividad</label>
        <textarea v-model="draft.definition" rows="3"></textarea>
      </div>
      <div class="field">
        <label>Lineamiento de asignación</label>
        <textarea v-model="draft.guideline" rows="3"></textarea>
      </div>

      <div class="grid cols-3" style="gap: 10px">
        <div v-if="originalCode === '40108'" class="field">
          <label>Porcentaje automático de PSE (% sobre 40104)</label>
          <input
            v-model.number="draft.psePercentage"
            type="number"
            min="0"
            max="100"
            placeholder="25"
          />
        </div>
        <div v-else class="field">
          <label>Horas mínimas (vacío si no aplica)</label>
          <input
            v-model.number="draft.baseHours"
            type="number"
            min="0"
            max="240"
            placeholder="Sin mínimo"
          />
        </div>

        <div class="field">
          <label>Horas máximas (vacío si depende de aval)</label>
          <input
            v-model.number="draft.capHours"
            type="number"
            min="0"
            max="240"
            :disabled="originalCode === '40108'"
            placeholder="Según aval"
          />
        </div>
        <div class="field">
          <label>Tope con posgrado activo (opcional)</label>
          <input
            v-model.number="draft.postgraduateCapHours"
            type="number"
            min="0"
            max="240"
            placeholder="—"
          />
        </div>
      </div>

      <div class="grid cols-2" style="gap: 10px">
        <div class="field">
          <label>Control al superar el tope</label>
          <select v-model="draft.severity">
            <option value="blocking">Bloqueante (impide guardar sin ajuste)</option>
            <option value="justifiable_alert">
              Alerta justificable (exige justificación escrita)
            </option>
            <option value="informative">Informativa (aviso preventivo)</option>
          </select>
        </div>
        <UstaUnitMultiSelect v-model="draft.appliesTo" :units="store.units" />
      </div>

      <div
        style="background: var(--surface-soft); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px"
      >
        <div style="font-size: 12px; font-weight: 800; color: var(--navy); margin-bottom: 8px">
          Condiciones de aval (Anexo 3) y factor por unidad
        </div>

        <div class="grid cols-3" style="gap: 10px; margin-bottom: 10px">
          <label class="toggle">
            <input v-model="draft.requiresViceRectorApproval" type="checkbox" />
            <span class="toggle__track"></span>
            <span style="font-size: 11.5px; font-weight: 700">
              Requiere aval de Vicerrectoría (Anexo 3)
            </span>
          </label>

          <label class="toggle">
            <input v-model="draft.mandatoryInFaculty" type="checkbox" />
            <span class="toggle__track"></span>
            <span style="font-size: 11.5px; font-weight: 700">
              Uso obligatorio en la unidad
            </span>
          </label>

          <label class="toggle">
            <input v-model="draft.lockedByResearch" type="checkbox" />
            <span class="toggle__track"></span>
            <span style="font-size: 11.5px; font-weight: 700">
              Asignación exclusiva de Investigación (Anexo 7)
            </span>
          </label>
        </div>

        <div class="grid cols-3" style="gap: 10px">
          <div v-if="draft.requiresViceRectorApproval" class="field" style="margin: 0">
            <label>Formato Anexo 3</label>
            <select v-model="draft.annex3Format">
              <option :value="null">Formato general Anexo 3</option>
              <option value="10212">10212 · Internacionalización y movilidad</option>
              <option value="20223_20120">20223 / 20120 · Consultorio Jurídico y Conciliación</option>
              <option value="20222">20222 · Prácticas y pasantías</option>
              <option value="40126">40126 · Tutoría y consejería</option>
              <option value="40222">40222 · Proyectos institucionales</option>
              <option value="43401">43401 · Actividades académicas especiales</option>
            </select>
          </div>
          <div class="field" style="margin: 0">
            <label>Factor de horas por unidad (opcional)</label>
            <input
              v-model.number="draft.hoursPerUnitFactor"
              type="number"
              min="0"
              max="240"
              placeholder="Ej.: 4"
            />
          </div>
          <div class="field" style="margin: 0">
            <label>Unidad de medida (opcional)</label>
            <input
              v-model="draft.unitLabel"
              type="text"
              maxlength="80"
              placeholder="Ej.: semillero, proyecto, revista"
            />
          </div>
        </div>
      </div>

      <div
        style="background: var(--surface-soft); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-top: 6px"
      >
        <div style="font-size: 12px; font-weight: 800; color: var(--navy); margin-bottom: 4px">
          Reglas específicas por unidad académica
        </div>
        <p style="font-size: 11px; color: var(--ink-soft); margin: 0 0 10px">
          Defina un rango docente o bolsa particular para una unidad en este código.
        </p>

        <div
          style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.7fr 0.8fr auto; gap: 8px; align-items: end"
        >
          <div class="field field--sm">
            <label>Unidad académica</label>
            <select v-model="newFacultyRule.unitId">
              <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>
          <div class="field field--sm">
            <label>Mín. docente (h)</label>
            <input
              v-model.number="newFacultyRule.minTeacherHours"
              type="number"
              min="0"
              max="240"
            />
          </div>
          <div class="field field--sm">
            <label>Máx. docente (h)</label>
            <input
              v-model.number="newFacultyRule.maxTeacherHours"
              type="number"
              min="0"
              max="240"
            />
          </div>
          <div class="field field--sm">
            <label>Bolsa unidad (opc.)</label>
            <input
              v-model.number="newFacultyRule.facultyBagCap"
              type="number"
              min="0"
              max="500"
              placeholder="—"
            />
          </div>
          <button
            type="button"
            class="btn primary small"
            style="height: 34px"
            @click="addFacultyRuleToCode"
          >
            Agregar regla
          </button>
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
              <b style="color: var(--navy)">{{ rf.unitName }}</b> · Rango docente:
              <b style="font-family: var(--font-mono)">
                {{ rf.minTeacherHours ?? 0 }} a {{ rf.maxTeacherHours ?? '∞' }} h/mes
              </b>
              <span v-if="rf.facultyBagCap" style="margin-left: 8px; color: var(--blue)">
                · Tope bolsa: <b>{{ rf.facultyBagCap }} h</b>
              </span>
            </div>
            <button
              type="button"
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
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px; flex-wrap: wrap">
        <div v-if="draft && !isProtectedTrunkCode" style="display: inline-flex; align-items: center; gap: 6px">
          <template v-if="!confirmingDelete">
            <button
              type="button"
              class="btn danger small"
              @click="confirmingDelete = true"
            >
              Eliminar código
            </button>
          </template>
          <template v-else>
            <span style="font-size: 11.5px; font-weight: 700; color: var(--danger)">
              ¿Eliminar el código {{ originalCode }}?
            </span>
            <button
              type="button"
              class="btn ghost small"
              @click="confirmingDelete = false"
            >
              No
            </button>
            <button
              type="button"
              class="btn danger small"
              @click="handleDelete"
            >
              Sí, eliminar
            </button>
          </template>
        </div>
        <div v-else></div>
        <div style="display: flex; gap: 8px">
          <button type="button" class="btn ghost" @click="emit('close')">Cancelar</button>
          <button type="button" class="btn primary" @click="handleSave">Guardar cambios</button>
        </div>
      </div>
    </template>
  </UstaModal>
</template>
