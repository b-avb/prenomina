<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FacultyTeacher, SacCode, SubstantiveFunction } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import { printOfficialAnnex3Format } from '@/services/exporters';

const props = defineProps<{
  teacher: FacultyTeacher;
  assignableCodes: SacCode[];
  activeTeacherCodes: SacCode[];
}>();

const emit = defineEmits<{
  assignHours: [definition: SacCode, requestedHours: number];
  openAnnex3: [codeItem: SacCode];
  openException: [codeItem: SacCode];
}>();

const store = usePayrollStore();

const codesViewMode = ref<'assigned' | 'catalog'>('assigned');
const activeFunction = ref<SubstantiveFunction>('Enseñanza-Aprendizaje');
const selectedCodeInfo = ref<SacCode | null>(null);
const quickSelectedCode = ref<string>(props.assignableCodes[0]?.code ?? '');
const quickCodeHours = ref<number>(props.assignableCodes[0]?.baseHours ?? 8);

const substantiveFunctions: SubstantiveFunction[] = [
  'Enseñanza-Aprendizaje',
  'Proyección Social',
  'Investigación',
  'Gestión Académica',
];

watch(
  () => props.assignableCodes,
  (codes) => {
    if (!quickSelectedCode.value || !codes.some((c) => c.code === quickSelectedCode.value)) {
      const first = codes[0];
      if (first) {
        quickSelectedCode.value = first.code;
        quickCodeHours.value = first.baseHours ?? 8;
      }
    }
  },
  { immediate: true },
);

watch(quickSelectedCode, (code) => {
  const def = store.sacCodes.find((c) => c.code === code);
  if (def) {
    selectedCodeInfo.value = def;
    quickCodeHours.value = def.baseHours ?? 8;
  }
});

const codesByFunction = computed(() =>
  props.assignableCodes.filter((c) => c.substantiveFunction === activeFunction.value),
);

const displayedCodes = computed(() =>
  codesViewMode.value === 'assigned' ? props.activeTeacherCodes : codesByFunction.value,
);

function handleQuickAssignCode() {
  if (!quickSelectedCode.value) return;
  const definition = store.sacCodes.find((c) => c.code === quickSelectedCode.value);
  if (!definition) return;
  const hours = Math.max(1, Number(quickCodeHours.value) || 4);
  selectedCodeInfo.value = definition;
  emit('assignHours', definition, hours);
}

function getTeacherCodeApprovalStatus(teacherId: string, code: string) {
  return store.approvalRequests.find((r) => r.teacherId === teacherId && r.code === code);
}

function handlePrintTeacherCodeApproval(teacherId: string, code: string) {
  const req = getTeacherCodeApprovalStatus(teacherId, code);
  if (req) printOfficialAnnex3Format(req);
}
</script>

<template>
  <div class="panel-card">
    <div class="panel-card__head">
      <div>
        <h3>2. Funciones Sustantivas y Códigos SAC</h3>
        <p>
          {{
            codesViewMode === 'assigned'
              ? 'Mostrando únicamente los códigos activos del docente (sin ruido)'
              : `Explorador completo de los ${store.sacCodes.length} códigos del ANEXO 4`
          }}
        </p>
      </div>

      <div class="segmented-control">
        <button
          :class="{ active: codesViewMode === 'assigned' }"
          @click="codesViewMode = 'assigned'"
        >
          Activos ({{ activeTeacherCodes.length }})
        </button>
        <button
          :class="{ active: codesViewMode === 'catalog' }"
          @click="codesViewMode = 'catalog'"
        >
          Catálogo ({{ assignableCodes.length }})
        </button>
      </div>
    </div>

    <!-- Quick code assignment bar -->
    <div
      v-if="codesViewMode === 'assigned'"
      style="display: grid; grid-template-columns: 1fr 78px auto; gap: 6px; align-items: center; margin-bottom: 12px; background: var(--surface-soft); padding: 8px; border-radius: 9px"
    >
      <select
        v-model="quickSelectedCode"
        style="padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 600; color: var(--navy); width: 100%"
      >
        <optgroup
          v-for="fn in substantiveFunctions"
          :key="fn"
          :label="fn"
        >
          <option
            v-for="codeOption in assignableCodes.filter(
              (x) => x.substantiveFunction === fn,
            )"
            :key="codeOption.code"
            :value="codeOption.code"
          >
            {{ codeOption.code }} — {{ codeOption.name.replace('TUNJA ', '') }} ({{
              codeOption.baseHours ?? 0
            }}–{{ codeOption.capHours ?? 'Aval' }}h)
          </option>
        </optgroup>
      </select>
      <input
        v-model.number="quickCodeHours"
        type="number"
        min="1"
        max="240"
        step="2"
        placeholder="Horas"
        style="padding: 6px 7px; border: 1.5px solid var(--border); border-radius: 7px; font-family: var(--font-mono); font-weight: 700; font-size: 12px"
      />
      <button class="btn primary small" @click="handleQuickAssignCode">
        + Asignar
      </button>
    </div>

    <div v-else style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px">
      <button
        v-for="fn in substantiveFunctions"
        :key="fn"
        class="dia-chip"
        style="height: 28px; font-size: 11px"
        :class="{ active: activeFunction === fn }"
        @click="activeFunction = fn"
      >
        {{ fn }}
      </button>
    </div>

    <table class="compact-table">
      <thead>
        <tr>
          <th>Código y Actividad</th>
          <th>Rango</th>
          <th>Horas</th>
          <th v-if="store.versionComparisonMode">v1→v2</th>
          <th>Validación / Aval</th>
          <th style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="displayedCodes.length === 0">
          <td colspan="6" class="empty-note" style="padding: 14px 0; text-align: center">
            Este docente no tiene códigos adicionales asignados. Usa el selector superior para agregar uno.
          </td>
        </tr>
        <tr
          v-for="codeItem in displayedCodes"
          :key="codeItem.code"
        >
          <td
            data-label="Código"
            style="cursor: pointer"
            title="Haz clic para ver el lineamiento normativo de este código SAC"
            @click="selectedCodeInfo = codeItem"
          >
            <div style="display: flex; align-items: flex-start; gap: 6px">
              <span class="code-chip">{{ codeItem.code }}</span>
              <div>
                <b
                  style="color: var(--navy); font-size: 11.5px; line-height: 1.2; display: block"
                >
                  {{ codeItem.name.replace('TUNJA ', '') }}
                </b>
                <span style="font-size: 10.5px; color: var(--ink-soft)">
                  {{ codeItem.substantiveFunction }}
                </span>
              </div>
            </div>
          </td>
          <td
            data-label="Rango"
            style="font-family: var(--font-mono); font-size: 11px; white-space: nowrap"
          >
            {{ codeItem.baseHours ?? 0 }}–{{
              store.activeUnit.hasPostgraduates && codeItem.postgraduateCapHours
                ? `${codeItem.postgraduateCapHours}*`
                : `${codeItem.capHours ?? 'Aval'}`
            }}h
          </td>
          <td data-label="Horas">
            <div style="display: flex; align-items: center; gap: 4px">
              <input
                :value="teacher.allocations[codeItem.code]?.hours ?? 0"
                type="number"
                min="0"
                max="240"
                step="2"
                :disabled="codeItem.lockedByResearch && store.activeRole === 'dean'"
                style="width: 64px; padding: 4px 6px; border: 1.5px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 12px; color: var(--navy)"
                @change="
                  emit(
                    'assignHours',
                    codeItem,
                    Number(($event.target as HTMLInputElement).value) || 0,
                  )
                "
              />
              <span
                v-if="codeItem.hoursPerUnitFactor"
                style="font-size: 10px; color: var(--blue); font-weight: 700; white-space: nowrap"
                :title="`RN-08: ${codeItem.hoursPerUnitFactor} h por ${codeItem.unitLabel || 'unidad'}`"
              >
                ({{ codeItem.hoursPerUnitFactor }}h/{{ codeItem.unitLabel || 'u' }})
              </span>
            </div>
          </td>
          <td v-if="store.versionComparisonMode" data-label="v1→v2">
            <span
              v-if="
                teacher.allocations[codeItem.code]?.version1Hours !== undefined &&
                teacher.allocations[codeItem.code]?.version1Hours !==
                  (teacher.allocations[codeItem.code]?.hours ?? 0)
              "
              class="diff-pill"
            >
              <del>{{ teacher.allocations[codeItem.code]?.version1Hours }}</del>→<ins
                >{{ teacher.allocations[codeItem.code]?.hours ?? 0 }}h</ins
              >
            </span>
            <span v-else style="font-size: 10.5px; color: var(--ink-faint)">=</span>
          </td>
          <td data-label="Estado">
            <template v-if="(teacher.allocations[codeItem.code]?.hours ?? 0) > 0">
              <template v-if="codeItem.requiresViceRectorApproval">
                <span
                  v-if="getTeacherCodeApprovalStatus(teacher.id, codeItem.code)"
                  class="badge"
                  style="padding: 2px 6px; font-size: 10px"
                  :class="
                    getTeacherCodeApprovalStatus(teacher.id, codeItem.code)?.status ===
                    'Avalado'
                      ? 'aprobado'
                      : getTeacherCodeApprovalStatus(teacher.id, codeItem.code)?.status ===
                          'Con Observaciones'
                        ? 'reprobado'
                        : 'pendiente'
                  "
                >
                  V.A.:
                  {{ getTeacherCodeApprovalStatus(teacher.id, codeItem.code)?.status }}
                </span>
                <span
                  v-else
                  class="badge reprobado"
                  style="padding: 2px 6px; font-size: 10px"
                >
                  Falta ANEXO 3
                </span>
              </template>
              <span
                v-else-if="codeItem.lockedByResearch"
                class="badge inscrito"
                style="padding: 2px 6px; font-size: 10px"
              >
                Fijo Inv.
              </span>
              <span
                v-else
                style="font-size: 11px; color: var(--success); font-weight: 700"
              >
                ✓ Activo
              </span>
            </template>
            <span v-else style="font-size: 11px; color: var(--ink-faint)">—</span>
          </td>
          <td style="text-align: right; white-space: nowrap">
            <div style="display: flex; gap: 4px; justify-content: flex-end">
              <button
                v-if="codeItem.requiresViceRectorApproval"
                class="btn accent small"
                style="padding: 3px 8px; font-size: 11px"
                @click.stop="emit('openAnnex3', codeItem)"
              >
                ANEXO 3
              </button>
              <button
                v-if="
                  codeItem.requiresViceRectorApproval &&
                  getTeacherCodeApprovalStatus(teacher.id, codeItem.code)
                "
                class="btn ghost small"
                style="padding: 3px 7px; font-size: 11px"
                title="Imprimir / Guardar PDF Oficial ANEXO 3"
                @click.stop="handlePrintTeacherCodeApproval(teacher.id, codeItem.code)"
              >
                🖨 PDF
              </button>
              <button
                v-if="(teacher.allocations[codeItem.code]?.hours ?? 0) > 0"
                class="btn ghost small"
                style="padding: 3px 8px; font-size: 11px"
                @click.stop="emit('openException', codeItem)"
              >
                {{ store.activeRole === 'director' ? 'Ajustar' : 'Nota' }}
              </button>
              <button
                v-if="
                  (teacher.allocations[codeItem.code]?.hours ?? 0) > 0 &&
                  !(codeItem.lockedByResearch && store.activeRole === 'dean')
                "
                class="btn ghost small"
                style="padding: 3px 7px; color: var(--danger)"
                title="Quitar código"
                @click.stop="store.updateCodeAllocation(teacher.id, codeItem.code, 0)"
              >
                ×
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Contextual Annex 4 Guideline Popover -->
    <div
      v-if="selectedCodeInfo"
      class="lineamiento-popover"
      style="margin-top: 12px; margin-bottom: 0"
    >
      <div class="lineamiento-popover__head">
        <span>
          📌 Lineamiento {{ selectedCodeInfo.code }} ·
          {{ selectedCodeInfo.name.replace('TUNJA ', '') }}
        </span>
        <button
          style="border: none; background: transparent; cursor: pointer; font-weight: 700; color: var(--ink-soft)"
          @click="selectedCodeInfo = null"
        >
          × Cerrar
        </button>
      </div>
      <div class="lineamiento-popover__body">
        {{ selectedCodeInfo.guideline }}
        <div style="margin-top: 4px; font-weight: 700; color: var(--navy)">
          Rango ANEXO 4: {{ selectedCodeInfo.baseHours ?? 0 }} h –
          {{
            store.activeUnit.hasPostgraduates && selectedCodeInfo.postgraduateCapHours
              ? `${selectedCodeInfo.postgraduateCapHours} h (con posgrado)`
              : `${selectedCodeInfo.capHours ?? 'Según aval'} h`
          }}
          · Aplica a: {{ selectedCodeInfo.appliesTo }}
        </div>
      </div>
    </div>
  </div>
</template>
