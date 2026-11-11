<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const originalCode = ref<string>('');
const draft = ref<SacCode | null>(null);

const isProtectedTrunkCode = computed(
  () => originalCode.value === '40104' || originalCode.value === '40108',
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
    if (item) {
      originalCode.value = item.code;
      draft.value = {
        ...structuredClone(item),
        postgraduateCapHours: item.postgraduateCapHours ?? null,
        psePercentage: item.psePercentage ?? null,
        hoursPerUnitFactor: item.hoursPerUnitFactor ?? null,
        unitLabel: item.unitLabel ?? null,
        annex3Format: item.annex3Format ?? null,
        mandatoryInFaculty: Boolean(item.mandatoryInFaculty),
        lockedByResearch: Boolean(item.lockedByResearch),
        facultyRules: item.facultyRules ? structuredClone(item.facultyRules) : [],
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
  const targetCode = draft.value.code.trim().toUpperCase();
  if (!targetCode || !draft.value.name.trim()) {
    store.showToast('El código SAC y el nombre de la actividad son obligatorios', 'error');
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
    store.showToast(`Código SAC ${res.data.code} actualizado en el catálogo ANEXO 4`);
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
    :title="draft ? `Configurar Código SAC ${originalCode} y Parámetros Normativos` : ''"
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
              (Troncal)
            </span>
          </label>
          <input
            v-model="draft.code"
            type="text"
            maxlength="20"
            :disabled="isProtectedTrunkCode"
            style="font-family: var(--font-mono); font-weight: 700"
          />
        </div>
        <div class="field" style="grid-column: span 2">
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
        <label>Nombre Oficial de la Actividad (ANEXO 4)</label>
        <input v-model="draft.name" type="text" maxlength="200" />
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
        <div v-if="originalCode === '40108'" class="field">
          <label>Porcentaje Automático PSE (% sobre 40104)</label>
          <input
            v-model.number="draft.psePercentage"
            type="number"
            min="0"
            max="100"
            placeholder="25"
          />
        </div>
        <div v-else class="field">
          <label>Base Horas (Mínimo General · vacío = sin mín.)</label>
          <input
            v-model.number="draft.baseHours"
            type="number"
            min="0"
            max="240"
            placeholder="Sin mínimo"
          />
        </div>

        <div class="field">
          <label>Tope Horas (Máximo General · vacío = según aval)</label>
          <input
            v-model.number="draft.capHours"
            type="number"
            min="0"
            max="240"
            :disabled="originalCode === '40108'"
            placeholder="Según aval / sin tope"
          />
        </div>
        <div class="field">
          <label>Tope con Posgrado Activo (Opcional)</label>
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
          <label>Comportamiento si se supera el tope</label>
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

      <!-- PRE-AVAL ANEXO 3, MULTIPLICADOR Y BANDERAS NORMATIVAS -->
      <div
        style="background: var(--surface-soft); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px"
      >
        <div style="font-size: 12px; font-weight: 800; color: var(--navy); margin-bottom: 8px">
          ⚙️ Condiciones Normativas, Pre-Aval (ANEXO 3) y Multiplicador por Unidad
        </div>

        <div class="grid cols-3" style="gap: 10px; margin-bottom: 10px">
          <label class="toggle">
            <input v-model="draft.requiresViceRectorApproval" type="checkbox" />
            <span class="toggle__track"></span>
            <span style="font-size: 11.5px; font-weight: 700">
              Requiere Pre-Aval V.A. (ANEXO 3)
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
              Cargue exclusivo Investigación (ANEXO 7)
            </span>
          </label>
        </div>

        <div class="grid cols-3" style="gap: 10px">
          <div v-if="draft.requiresViceRectorApproval" class="field" style="margin: 0">
            <label>Plantilla de Pre-Aval (ANEXO 3)</label>
            <select v-model="draft.annex3Format">
              <option :value="null">Formato General ANEXO 3</option>
              <option value="10212">10212 · Internacionalización / Movilidad</option>
              <option value="20223_20120">20223 / 20120 · Consultorio Jurídico y Conciliación</option>
              <option value="20222">20222 · Prácticas y Pasantías</option>
              <option value="40126">40126 · Tutoría y Consejería</option>
              <option value="40222">40222 · Proyectos Institucionales</option>
              <option value="43401">43401 · Actividades Académicas Especiales</option>
            </select>
          </div>
          <div class="field" style="margin: 0">
            <label>Factor Horas por Unidad (Opc.)</label>
            <input
              v-model.number="draft.hoursPerUnitFactor"
              type="number"
              min="0"
              max="240"
              placeholder="Ej: 4"
            />
          </div>
          <div class="field" style="margin: 0">
            <label>Etiqueta Unidad (Opc.)</label>
            <input
              v-model="draft.unitLabel"
              type="text"
              maxlength="80"
              placeholder="Ej: semillero, proyecto, revista"
            />
          </div>
        </div>
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
          v-if="draft && !isProtectedTrunkCode"
          class="btn danger small"
          @click="handleDelete"
        >
          Eliminar Código del Catálogo
        </button>
        <div v-else></div>
        <div style="display: flex; gap: 8px">
          <button class="btn ghost" @click="emit('close')">Cancelar</button>
          <button class="btn primary" @click="handleSave">Guardar Cambios</button>
        </div>
      </div>
    </template>
  </UstaModal>
</template>
