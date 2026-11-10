<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FacultyTeacher, SacCode, ValidationAlert } from '@usta/domain';
import { usePayrollStore } from '@/stores/payroll.store';

const props = defineProps<{
  teacher: FacultyTeacher;
  activeCodesCount: number;
  alerts: ValidationAlert[];
}>();

const emit = defineEmits<{
  editProfile: [];
  removeTeacher: [];
  openAnnex3: [codeItem: SacCode];
  openException: [codeItem: SacCode];
}>();

const store = usePayrollStore();
const showHourBalancerPanel = ref(false);

watch(
  () => props.teacher.id,
  () => {
    showHourBalancerPanel.value = false;
  },
);

const totalHours = computed(() => store.computeTeacherTotalHours(props.teacher));
const hours40104 = computed(() => store.computeHours40104(props.teacher));
const effectivePse = computed(() => store.getEffectivePse(props.teacher));
const otherSacHours = computed(() => store.computeOtherSacHours(props.teacher));
const exactPse25 = computed(() => store.computeExactPse25(props.teacher));
const balanceSuggestions = computed(() =>
  showHourBalancerPanel.value ? store.suggestTeacherHourBalance(props.teacher.id) : [],
);

function findSacCode(code: string): SacCode | undefined {
  return store.sacCodes.find((c) => c.code === code);
}
</script>

<template>
  <!-- 1. TEACHER SUMMARY CARD -->
  <div class="docente-summary-card">
    <div class="docente-summary-card__top">
      <div class="docente-summary-card__identity">
        <h2>
          <span>{{ teacher.fullName }}</span>
          <span class="badge inscrito">{{ teacher.dedication }}</span>
          <span v-if="teacher.isProvisional" class="badge pendiente">
            Vacante Provisional
          </span>
          <span
            v-if="teacher.sharedHours"
            class="badge aprobado"
            title="Horas orientadas en otros programas o unidades académicas (RN-17)"
          >
            Compartido: {{ teacher.sharedHours }} h ({{
              teacher.sharedUnitName || 'Otra unidad'
            }})
          </span>
        </h2>
        <p>
          <b>CC {{ teacher.documentId }}</b> · {{ teacher.rank }} ·
          {{ teacher.education || 'Sin formación registrada' }}
        </p>
      </div>

      <div class="docente-summary-card__kpis">
        <div class="kpi-mini">
          <b>{{ hours40104 }} h</b>
          <span>40104 Clases</span>
        </div>
        <div class="kpi-mini ok">
          <b>{{ effectivePse }} h</b>
          <span>40108 PSE (25%)</span>
        </div>
        <div class="kpi-mini">
          <b>{{ otherSacHours }} h</b>
          <span>Otros Códigos ({{ activeCodesCount }})</span>
        </div>
        <div
          class="kpi-mini"
          :class="
            totalHours === teacher.expectedWorkload
              ? 'ok'
              : totalHours > teacher.expectedWorkload
                ? 'danger'
                : 'warn'
          "
        >
          <b>{{ totalHours }} / {{ teacher.expectedWorkload }} h</b>
          <span>Total Mes</span>
        </div>

        <div style="display: flex; gap: 6px; margin-left: 4px">
          <button
            v-if="totalHours !== teacher.expectedWorkload"
            class="btn accent small"
            title="Sugerir actividades o bolsas con saldo disponible para cuadrar las horas del docente"
            @click="showHourBalancerPanel = !showHourBalancerPanel"
          >
            ✨ Sugerir Cuadre ({{
              totalHours < teacher.expectedWorkload
                ? `+${teacher.expectedWorkload - totalHours}h`
                : `-${totalHours - teacher.expectedWorkload}h`
            }})
          </button>
          <button
            class="btn ghost small"
            title="Editar datos del docente o configurar horas compartidas con otra unidad (RN-17)"
            @click="emit('editProfile')"
          >
            ✎ Perfil
          </button>
          <button
            v-if="store.activeUnitTeachers.length > 1"
            class="btn danger small"
            title="Retirar docente de la prenómina"
            @click="emit('removeTeacher')"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 12px">
      <div class="hours-gauge__track" style="flex: 1; height: 7px">
        <div
          class="hours-gauge__fill"
          :class="{ over: totalHours > teacher.expectedWorkload }"
          :style="{
            width: `${Math.min(100, (totalHours / teacher.expectedWorkload) * 100)}%`,
          }"
        ></div>
      </div>
      <span style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-soft)">
        {{ Math.round((totalHours / teacher.expectedWorkload) * 100) }}% de
        {{ teacher.expectedWorkload }} h/mes
      </span>
    </div>
  </div>

  <!-- SMART HOUR BALANCER PANEL -->
  <div
    v-if="showHourBalancerPanel && totalHours !== teacher.expectedWorkload"
    class="card"
    style="padding: 14px 16px; margin-bottom: 14px; border: 1.5px solid var(--gold); background: #fffdf7"
  >
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px"
    >
      <div>
        <b style="color: var(--navy); font-size: 12.5px">
          ✨ Asistente de Cuadre de Horas (Dirección E&A)
        </b>
        <span style="font-size: 11.5px; color: var(--ink-soft); margin-left: 8px">
          Sugerencias calculadas según saldos de bolsas de la facultad (ANEXO 5/6) y topes del ANEXO 4:
        </span>
      </div>
      <button class="btn ghost small" @click="showHourBalancerPanel = false">
        Cerrar
      </button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <div
        v-for="suggestion in balanceSuggestions"
        :key="suggestion.id"
        style="display: flex; justify-content: space-between; align-items: center; gap: 10px; background: #fff; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border)"
      >
        <div>
          <div style="display: flex; align-items: center; gap: 6px">
            <span class="code-chip">{{ suggestion.code }}</span>
            <b style="font-size: 12px; color: var(--navy)">
              {{ suggestion.activityName }}
            </b>
            <span
              class="badge"
              :class="suggestion.delta > 0 ? 'aprobado' : 'pendiente'"
              style="font-family: var(--font-mono)"
            >
              {{ suggestion.currentHours }}h → {{ suggestion.proposedHours }}h ({{
                suggestion.delta > 0 ? `+${suggestion.delta}h` : `${suggestion.delta}h`
              }})
            </span>
          </div>
          <div style="font-size: 11px; color: var(--ink-soft); margin-top: 2px">
            {{ suggestion.explanation }}
          </div>
        </div>
        <button
          class="btn primary small"
          @click="
            store.applyBalanceSuggestion(teacher.id, suggestion);
            if (store.computeTeacherTotalHours(teacher) === teacher.expectedWorkload) {
              showHourBalancerPanel = false;
            }
          "
        >
          Aplicar Ajuste
        </button>
      </div>
    </div>
  </div>

  <!-- 2. TEACHER ALERTS & TRACEABILITY -->
  <div
    v-if="teacher.generalNote || alerts.length > 0"
    class="alertas-compact-bar"
  >
    <div v-if="teacher.generalNote" class="alertas-compact-bar__item info">
      <span><b>Trazabilidad E&A:</b> {{ teacher.generalNote }}</span>
    </div>

    <div
      v-for="alertItem in alerts"
      :key="alertItem.id"
      class="alertas-compact-bar__item"
      :class="
        alertItem.severity === 'blocking'
          ? 'bloqueante'
          : alertItem.severity === 'alert'
            ? 'alerta'
            : 'info'
      "
    >
      <div>
        <b>[{{ alertItem.ruleId }}] {{ alertItem.title }}</b> —
        <span style="opacity: 0.9">{{ alertItem.detail }}</span>
      </div>
      <div style="display: flex; gap: 6px; flex-shrink: 0">
        <button
          v-if="alertItem.ruleId === 'RN-02'"
          class="btn primary small"
          style="padding: 3px 9px; font-size: 11px"
          @click="store.autoFixTeacherPse(teacher.id)"
        >
          Ajustar PSE a {{ exactPse25 }} h
        </button>
        <button
          v-if="alertItem.code && alertItem.ruleId === 'RN-09' && findSacCode(alertItem.code)"
          class="btn accent small"
          style="padding: 3px 9px; font-size: 11px"
          @click="emit('openAnnex3', findSacCode(alertItem.code)!)"
        >
          Formato ANEXO 3
        </button>
        <button
          v-if="alertItem.code && alertItem.ruleId === 'RN-03' && findSacCode(alertItem.code)"
          class="btn ghost small"
          style="padding: 3px 9px; font-size: 11px"
          @click="emit('openException', findSacCode(alertItem.code)!)"
        >
          Justificar
        </button>
      </div>
    </div>
  </div>
</template>
