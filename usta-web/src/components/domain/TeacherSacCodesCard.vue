<script setup lang="ts">
/**
 * Interactive card for assigning SAC activity hours to a teacher, linking Annex 5 program quotas,
 * inspecting Annex 4 guidelines, and launching Annex 3 or cap-exception workflows.
 */
import { computed, ref, watch } from 'vue';
import type {
  FacultyTeacher,
  ProgramQuotaAnnex5,
  SacCode,
  SubstantiveFunction,
} from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';
import type { AllocationProgramRef } from '@/stores/workload.store';
import { printOfficialAnnex3Format } from '@/services/exporters';

const PROGRAM_LINKABLE_CODES = new Set([
  '30411',
  '40106',
  '40109',
  '40127',
  '40006',
  '40138',
  '30407',
  '30312',
  '20502',
]);

const POSTGRAD_ONLY_CODES = new Set(['40006', '40138', '30407']);

const props = defineProps<{
  teacher: FacultyTeacher;
  assignableCodes: SacCode[];
  activeTeacherCodes: SacCode[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  assignHours: [
    definition: SacCode,
    requestedHours: number,
    programInfo?: AllocationProgramRef,
  ];
  openAnnex3: [codeItem: SacCode];
  openException: [codeItem: SacCode];
}>();

const store = usePayrollStore();

const codesViewMode = ref<'assigned' | 'catalog'>('assigned');
const activeFunction = ref<SubstantiveFunction>('Enseñanza-Aprendizaje');
const selectedCodeInfo = ref<SacCode | null>(null);
const quickSelectedCode = ref<string>(props.assignableCodes[0]?.code ?? '');
const quickCodeHours = ref<number>(props.assignableCodes[0]?.baseHours ?? 8);
const quickSelectedProgramId = ref<string>('');

const substantiveFunctions: SubstantiveFunction[] = [
  'Enseñanza-Aprendizaje',
  'Proyección Social',
  'Investigación',
  'Gestión Académica',
];

const unitPrograms = computed<ProgramQuotaAnnex5[]>(() =>
  store.programQuotas.filter((p) => p.unitId === props.teacher.unitId),
);

function isProgramLinkable(code: string): boolean {
  return PROGRAM_LINKABLE_CODES.has(code) && unitPrograms.value.length > 0;
}

function getProgramsForCode(code: string): ProgramQuotaAnnex5[] {
  if (POSTGRAD_ONLY_CODES.has(code)) {
    const postgrad = unitPrograms.value.filter(
      (p) =>
        p.level !== 'Pregrado' ||
        /posgrado|especializaci[oó]n|maestr[ií]a|doctorado/i.test(p.programName),
    );
    return postgrad.length > 0 ? postgrad : unitPrograms.value;
  }
  return unitPrograms.value;
}

function getProgramCapForCode(program: ProgramQuotaAnnex5, code: string): number | null {
  switch (code) {
    case '30411':
      return program.quality30411;
    case '40106':
      return program.curriculum40106;
    case '40109':
      return program.sea40109;
    case '40127':
      return program.saberPro40127;
    default:
      return null;
  }
}

function sumProgramHoursInUnit(programId: string, code: string): number {
  let sum = 0;
  for (const t of store.activeUnitTeachers) {
    const alloc = t.allocations[code];
    if (alloc && alloc.programId === programId && alloc.hours > 0) {
      sum += alloc.hours;
    }
  }
  return sum;
}

function resolveProgramInfo(programId: string): AllocationProgramRef {
  if (!programId) {
    return { programId: null, programName: null };
  }
  const found = unitPrograms.value.find((p) => p.id === programId);
  return {
    programId: found?.id ?? programId,
    programName: found?.programName ?? null,
  };
}

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

watch(
  () => [quickSelectedCode.value, props.teacher.unitId] as const,
  ([code]) => {
    const def = store.sacCodes.find((c) => c.code === code);
    if (def) {
      selectedCodeInfo.value = def;
      quickCodeHours.value = def.baseHours ?? 8;
    }
    if (isProgramLinkable(code)) {
      const existingProgId = props.teacher.allocations[code]?.programId ?? '';
      const available = getProgramsForCode(code);
      if (existingProgId && available.some((p) => p.id === existingProgId)) {
        quickSelectedProgramId.value = existingProgId;
      } else if (available.length === 1) {
        quickSelectedProgramId.value = available[0]!.id;
      } else {
        quickSelectedProgramId.value = '';
      }
    } else {
      quickSelectedProgramId.value = '';
    }
  },
);

watch(quickSelectedProgramId, (programId) => {
  if (!programId || !quickSelectedCode.value) return;
  const prog = unitPrograms.value.find((p) => p.id === programId);
  if (!prog) return;
  const cap = getProgramCapForCode(prog, quickSelectedCode.value);
  if (cap !== null && cap > 0) {
    const used = sumProgramHoursInUnit(programId, quickSelectedCode.value);
    const currentTeacherHours =
      props.teacher.allocations[quickSelectedCode.value]?.programId === programId
        ? (props.teacher.allocations[quickSelectedCode.value]?.hours ?? 0)
        : 0;
    const remaining = Math.max(0, cap - (used - currentTeacherHours));
    if (remaining > 0) {
      quickCodeHours.value = remaining;
    }
  }
});

const codesByFunction = computed(() =>
  props.assignableCodes.filter((c) => c.substantiveFunction === activeFunction.value),
);

const displayedCodes = computed(() =>
  codesViewMode.value === 'assigned' ? props.activeTeacherCodes : codesByFunction.value,
);

function handleQuickAssignCode() {
  if (props.readonly || !quickSelectedCode.value) return;
  const definition = store.sacCodes.find((c) => c.code === quickSelectedCode.value);
  if (!definition) return;
  const hours = Math.max(1, Number(quickCodeHours.value) || 4);
  selectedCodeInfo.value = definition;
  const programInfo = isProgramLinkable(definition.code)
    ? resolveProgramInfo(quickSelectedProgramId.value)
    : undefined;
  emit('assignHours', definition, hours, programInfo);
}

function handleChangeRowProgram(codeItem: SacCode, nextProgramId: string) {
  if (props.readonly) return;
  const currentHours = props.teacher.allocations[codeItem.code]?.hours ?? 0;
  if (currentHours <= 0) return;
  emit('assignHours', codeItem, currentHours, resolveProgramInfo(nextProgramId));
}

function formatEffectiveCapLabel(codeItem: SacCode): string {
  const alloc = props.teacher.allocations[codeItem.code];
  if (alloc?.programId) {
    const prog = unitPrograms.value.find((p) => p.id === alloc.programId);
    if (prog) {
      const progCap = getProgramCapForCode(prog, codeItem.code);
      if (progCap !== null) return `${progCap}p`;
    }
  }
  if (store.activeUnit.hasPostgraduates && codeItem.postgraduateCapHours) {
    return `${codeItem.postgraduateCapHours}*`;
  }
  return `${codeItem.capHours ?? 'Aval'}`;
}

function getTeacherCodeApprovalStatus(teacherId: string, code: string) {
  return store.approvalRequests.find((r) => r.teacherId === teacherId && r.code === code);
}

function handlePrintTeacherCodeApproval(teacherId: string, code: string) {
  const req = getTeacherCodeApprovalStatus(teacherId, code);
  if (req) printOfficialAnnex3Format(req, store.activePeriod);
}
</script>

<template>
  <div class="panel-card">
    <div class="panel-card__head">
      <div>
        <h3>Actividades y códigos SAC</h3>
        <p>
          {{
            codesViewMode === 'assigned'
              ? 'Códigos asignados al docente en este periodo.'
              : `Catálogo de ${store.sacCodes.length} códigos del Anexo 4.`
          }}
        </p>
      </div>

      <div class="segmented-control">
        <button
          type="button"
          :class="{ active: codesViewMode === 'assigned' }"
          @click="codesViewMode = 'assigned'"
        >
          Activos ({{ activeTeacherCodes.length }})
        </button>
        <button
          type="button"
          :class="{ active: codesViewMode === 'catalog' }"
          @click="codesViewMode = 'catalog'"
        >
          Catálogo ({{ assignableCodes.length }})
        </button>
      </div>
    </div>

    <div
      v-if="codesViewMode === 'assigned' && !readonly"
      style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; background: var(--surface-soft); padding: 8px; border-radius: 9px"
    >
      <div
        style="display: grid; grid-template-columns: 1fr 78px auto; gap: 6px; align-items: center"
      >
        <select
          v-model="quickSelectedCode"
          class="control-sm"
          style="width: 100%"
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
          class="control-sm control-sm--num"
        />
        <button
          type="button"
          class="btn primary small"
          style="height: 34px"
          @click="handleQuickAssignCode"
        >
          Asignar
        </button>
      </div>

      <div
        v-if="isProgramLinkable(quickSelectedCode)"
        style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap"
      >
        <span style="font-size: 11px; font-weight: 700; color: var(--navy); white-space: nowrap">
          Programa asociado (Anexo 5):
        </span>
        <select
          v-model="quickSelectedProgramId"
          class="control-sm"
          style="flex: 1; min-width: 220px"
        >
          <option value="">Bolsa consolidada de la unidad</option>
          <option
            v-for="prog in getProgramsForCode(quickSelectedCode)"
            :key="prog.id"
            :value="prog.id"
          >
            {{ prog.programName }} ({{ prog.level }}){{
              getProgramCapForCode(prog, quickSelectedCode) !== null
                ? ` · Usado ${sumProgramHoursInUnit(prog.id, quickSelectedCode)}/${getProgramCapForCode(prog, quickSelectedCode)}h`
                : ''
            }}{{ !prog.isActive ? ' [Cohorte excluida]' : '' }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-else-if="codesViewMode === 'catalog'"
      style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px"
    >
      <button
        v-for="fn in substantiveFunctions"
        :key="fn"
        type="button"
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
          <th>Código y actividad</th>
          <th>Rango</th>
          <th>Horas</th>
          <th v-if="store.versionComparisonMode">Versión inicial</th>
          <th>Estado</th>
          <th style="text-align: right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="displayedCodes.length === 0">
          <td colspan="6" class="empty-note" style="padding: 14px 0; text-align: center">
            {{
              readonly
                ? 'Sin códigos adicionales asignados en este periodo.'
                : 'Sin códigos adicionales asignados. Seleccione uno arriba para registrarlo.'
            }}
          </td>
        </tr>
        <tr
          v-for="codeItem in displayedCodes"
          :key="codeItem.code"
        >
          <td
            data-label="Código"
            style="cursor: pointer"
            title="Ver lineamiento del código"
            @click="selectedCodeInfo = codeItem"
          >
            <div style="display: flex; align-items: flex-start; gap: 6px">
              <span class="code-chip">{{ codeItem.code }}</span>
              <div style="min-width: 0; flex: 1">
                <b
                  style="color: var(--navy); font-size: 11.5px; line-height: 1.2; display: block"
                >
                  {{ codeItem.name.replace('TUNJA ', '') }}
                </b>
                <span style="font-size: 10.5px; color: var(--ink-soft)">
                  {{ codeItem.substantiveFunction }}
                </span>

                <div
                  v-if="
                    isProgramLinkable(codeItem.code) &&
                    (teacher.allocations[codeItem.code]?.hours ?? 0) > 0
                  "
                  style="margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap"
                  @click.stop
                >
                  <select
                    :value="teacher.allocations[codeItem.code]?.programId ?? ''"
                    :disabled="
                      readonly ||
                      (Boolean(codeItem.lockedByResearch) && store.activeRole === 'dean')
                    "
                    class="table-select"
                    style="font-size: 10.5px; height: 26px; padding: 0 22px 0 7px; max-width: 260px"
                    title="Programa académico al que aporta este código"
                    @change="
                      handleChangeRowProgram(
                        codeItem,
                        ($event.target as HTMLSelectElement).value,
                      )
                    "
                  >
                    <option value="">Programa: Consolidado unidad</option>
                    <option
                      v-for="prog in getProgramsForCode(codeItem.code)"
                      :key="prog.id"
                      :value="prog.id"
                    >
                      {{ prog.programName }} ({{ prog.level }}){{
                        getProgramCapForCode(prog, codeItem.code) !== null
                          ? ` — ${sumProgramHoursInUnit(prog.id, codeItem.code)}/${getProgramCapForCode(prog, codeItem.code)}h`
                          : ''
                      }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </td>
          <td
            data-label="Rango"
            style="font-family: var(--font-mono); font-size: 11px; white-space: nowrap"
          >
            {{ codeItem.baseHours ?? 0 }}–{{ formatEffectiveCapLabel(codeItem) }}h
          </td>
          <td data-label="Horas">
            <div style="display: flex; align-items: center; gap: 4px">
              <input
                :value="teacher.allocations[codeItem.code]?.hours ?? 0"
                type="number"
                min="0"
                max="240"
                step="2"
                :disabled="
                  readonly ||
                  (Boolean(codeItem.lockedByResearch) && store.activeRole === 'dean')
                "
                class="table-input table-input--num"
                style="width: 64px"
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
                :title="`${codeItem.hoursPerUnitFactor} h por ${codeItem.unitLabel || 'unidad'}`"
              >
                ({{ codeItem.hoursPerUnitFactor }}h/{{ codeItem.unitLabel || 'u' }})
              </span>
            </div>
          </td>
          <td v-if="store.versionComparisonMode" data-label="Versión inicial">
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
                          'Con Observaciones' ||
                          getTeacherCodeApprovalStatus(teacher.id, codeItem.code)?.status ===
                            'Rechazado'
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
                  Falta Anexo 3
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
                Activo
              </span>
            </template>
            <span v-else style="font-size: 11px; color: var(--ink-faint)">—</span>
          </td>
          <td style="text-align: right; white-space: nowrap">
            <div style="display: flex; gap: 4px; justify-content: flex-end">
              <button
                v-if="!readonly && codeItem.requiresViceRectorApproval"
                type="button"
                class="btn accent small"
                style="padding: 3px 8px; font-size: 11px"
                @click.stop="emit('openAnnex3', codeItem)"
              >
                Anexo 3
              </button>
              <button
                v-if="
                  codeItem.requiresViceRectorApproval &&
                  getTeacherCodeApprovalStatus(teacher.id, codeItem.code)
                "
                type="button"
                class="btn ghost small"
                style="padding: 3px 7px; font-size: 11px"
                title="Imprimir o guardar PDF del Anexo 3"
                @click.stop="handlePrintTeacherCodeApproval(teacher.id, codeItem.code)"
              >
                PDF
              </button>
              <button
                v-if="!readonly && (teacher.allocations[codeItem.code]?.hours ?? 0) > 0"
                type="button"
                class="btn ghost small"
                style="padding: 3px 8px; font-size: 11px"
                @click.stop="emit('openException', codeItem)"
              >
                {{
                  store.activeRole === 'director' || store.activeRole === 'vice_rector'
                    ? 'Ajustar'
                    : 'Nota'
                }}
              </button>
              <button
                v-if="
                  !readonly &&
                  (teacher.allocations[codeItem.code]?.hours ?? 0) > 0 &&
                  !(codeItem.lockedByResearch && store.activeRole === 'dean')
                "
                type="button"
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

    <div
      v-if="selectedCodeInfo"
      class="lineamiento-popover"
      style="margin-top: 12px; margin-bottom: 0"
    >
      <div class="lineamiento-popover__head">
        <span>
          Lineamiento {{ selectedCodeInfo.code }} ·
          {{ selectedCodeInfo.name.replace('TUNJA ', '') }}
        </span>
        <button
          type="button"
          style="border: none; background: transparent; cursor: pointer; font-weight: 700; color: var(--ink-soft)"
          @click="selectedCodeInfo = null"
        >
          Cerrar
        </button>
      </div>
      <div class="lineamiento-popover__body">
        {{ selectedCodeInfo.guideline }}
        <div style="margin-top: 4px; font-weight: 700; color: var(--navy)">
          Rango Anexo 4: {{ selectedCodeInfo.baseHours ?? 0 }} h –
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
