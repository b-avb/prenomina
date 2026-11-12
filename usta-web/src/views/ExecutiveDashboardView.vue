<script setup lang="ts">
/**
 * Sectional executive dashboard for Teaching & Learning Directorate and Academic Vice-Rectory
 * oversight, KPI tracking, process schedule management, and consolidated Excel export.
 */
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { cloneState } from '@/composables/useMutation';
import { usePayrollStore } from '@/stores/payroll.store';
import { exportSectionalConsolidatedXlsx } from '@/services/exporters';
import UstaModal from '@/components/ui/UstaModal.vue';
import ExecutiveUnitsInboxTab from '@/components/domain/ExecutiveUnitsInboxTab.vue';
import SectionalAnalyticsPanel from '@/components/domain/SectionalAnalyticsPanel.vue';
import AuditLogPanel from '@/components/domain/AuditLogPanel.vue';
import type { AcademicUnitSummary, SchedulePhase } from '@usta/domain';

const store = usePayrollStore();
const router = useRouter();

const activeTab = ref<'inbox' | 'analytics' | 'audit'>('inbox');
const unitToReturn = ref<AcademicUnitSummary | null>(null);
const returnObservations = ref<string>('');
const isScheduleModalOpen = ref(false);
const scheduleDrafts = ref<SchedulePhase[]>([]);

watch(isScheduleModalOpen, (isOpen) => {
  if (isOpen) {
    scheduleDrafts.value = cloneState(store.schedulePhases);
  }
});

async function handleSaveSchedule() {
  const ok = await store.saveSchedulePhases(scheduleDrafts.value);
  if (ok) {
    isScheduleModalOpen.value = false;
  }
}

const kpis = computed(() => {
  const total = store.units.length;
  const approved = store.units.filter((u) => u.payrollStatus === 'Avalada').length;
  const inReview = store.units.filter(
    (u) => u.payrollStatus === 'En Revisión' || u.payrollStatus === 'Enviada',
  ).length;
  const inDraft = store.units.filter((u) => u.payrollStatus === 'Borrador').length;
  const returned = store.units.filter(
    (u) => u.payrollStatus === 'Devuelta con Observaciones',
  ).length;
  const pendingVaApprovals = store.approvalRequests.filter((s) => s.status === 'Pendiente').length;
  const totalSectionalTeachers = store.teachers.length;
  const totalSectionalHours = store.teachers.reduce(
    (acc, t) => acc + store.computeTeacherTotalHours(t),
    0,
  );
  return {
    total,
    approved,
    inReview,
    inDraft,
    returned,
    pendingVaApprovals,
    totalSectionalTeachers,
    totalSectionalHours,
  };
});

function openFacultyReview(unit: AcademicUnitSummary, compareVersion1 = false) {
  store.selectUnit(unit.id);
  store.setVersionComparisonMode(compareVersion1);
  router.push('/dean/payroll');
}

const headerGovernanceLabel = computed(() =>
  store.activeRole === 'vice_rector'
    ? 'VICERRECTORÍA ACADÉMICA'
    : 'DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE',
);

async function confirmUnitReturn() {
  if (!unitToReturn.value) return;
  const res = await store.changePayrollStatus(
    unitToReturn.value.id,
    'Devuelta con Observaciones',
    returnObservations.value.trim() ||
      'Observaciones registradas en jornada de revisión de prenómina.',
  );
  if (res.ok) {
    unitToReturn.value = null;
    returnObservations.value = '';
  }
}

function handleExportSectionalConsolidated() {
  exportSectionalConsolidatedXlsx({
    period: store.activePeriod,
    units: store.units,
    teachers: store.teachers,
    sacCodes: store.sacCodes,
    approvalRequests: store.approvalRequests,
    researchAllocations: store.researchAllocations,
    auditLogs: store.auditLogs,
    computeHours40104: store.computeHours40104,
    getEffectivePse: store.getEffectivePse,
    computeTeacherTotalHours: store.computeTeacherTotalHours,
    sumCodeInUnit: store.sumCodeInUnit,
  });
  store.showToast('Consolidado seccional descargado');
}
</script>

<template>
  <div>
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          {{ headerGovernanceLabel }} · SECCIONAL TUNJA · {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Seguimiento seccional de prenómina
        </h1>
      </div>
      <div class="page-actions">
        <button
          type="button"
          class="btn accent small"
          :title="`Descargar consolidado seccional (${store.units.length} unidades)`"
          @click="handleExportSectionalConsolidated"
        >
          Exportar consolidado
        </button>
        <button class="btn ghost small" @click="router.push('/director/organization')">
          Unidades y programas
        </button>
        <button class="btn ghost small" @click="router.push('/director/catalog')">
          Catálogo SAC y cupos
        </button>
        <button class="btn primary small" @click="router.push('/vice-rector/approvals')">
          Solicitudes de aval ({{ kpis.pendingVaApprovals }})
        </button>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom: 16px; gap: 12px">
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px">{{ kpis.approved }} / {{ kpis.total }}</div>
        <div class="lbl">Unidades avaladas</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--blue)">{{ kpis.inReview }}</div>
        <div class="lbl">Enviadas o en revisión</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div
          class="num"
          style="font-size: 24px"
          :style="{ color: kpis.returned > 0 ? 'var(--danger)' : 'var(--ink-soft)' }"
        >
          {{ kpis.returned > 0 ? kpis.returned : kpis.inDraft }}
        </div>
        <div class="lbl">
          {{
            kpis.returned > 0
              ? `Devueltas (${kpis.inDraft} en borrador)`
              : 'En borrador'
          }}
        </div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--navy)">
          {{ kpis.totalSectionalTeachers }}
        </div>
        <div class="lbl">
          Docentes · {{ kpis.totalSectionalHours.toLocaleString('es-CO') }} h/mes
        </div>
      </div>
    </div>

    <div
      style="display: grid; grid-template-columns: repeat(4, 1fr) auto; gap: 8px; align-items: center; margin-bottom: 14px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 10px; padding: 9px 12px; font-size: 11px"
    >
      <div v-for="phase in store.schedulePhases" :key="phase.id">
        <span
          class="badge"
          :class="
            phase.status === 'Completada'
              ? 'aprobado'
              : phase.status === 'Activa'
                ? 'pendiente'
                : 'inscrito'
          "
          style="font-size: 9.5px; margin-right: 5px"
        >
          {{ phase.label }}
        </span>
        <b style="color: var(--navy)">{{ phase.title }}:</b> {{ phase.dateRange }}
      </div>
      <button
        type="button"
        class="btn ghost small"
        style="padding: 3px 8px; font-size: 11px"
        title="Editar fechas del cronograma"
        @click="isScheduleModalOpen = true"
      >
        Editar cronograma
      </button>
    </div>

    <div class="tabs" style="margin-bottom: 14px">
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'inbox' }"
        @click="activeTab = 'inbox'"
      >
        Unidades académicas ({{ store.units.length }})
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'analytics' }"
        @click="activeTab = 'analytics'"
      >
        Distribución por función sustantiva
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 'audit' }"
        @click="activeTab = 'audit'"
      >
        Historial de cambios ({{ store.auditLogs.length }})
      </button>
    </div>

    <ExecutiveUnitsInboxTab
      v-if="activeTab === 'inbox'"
      @open-review="openFacultyReview"
      @return-unit="(unit) => (unitToReturn = unit)"
    />

    <SectionalAnalyticsPanel v-else-if="activeTab === 'analytics'" />

    <AuditLogPanel v-else />

    <UstaModal
      :open="!!unitToReturn"
      title="Devolver prenómina"
      @close="unitToReturn = null"
    >
      <template v-if="unitToReturn">
        <p class="sub" style="margin-top: 0">
          Se devolverá la prenómina de <b>{{ unitToReturn.name }}</b> a
          <b>{{ unitToReturn.deanName }}</b> para realizar ajustes.
        </p>
        <div class="field">
          <label>Observaciones</label>
          <textarea
            v-model="returnObservations"
            rows="5"
            style="min-height: 150px"
            placeholder="Indique los ajustes requeridos antes de avalar la prenómina…"
          ></textarea>
        </div>
      </template>
      <template #actions>
        <button type="button" class="btn ghost" @click="unitToReturn = null">Cancelar</button>
        <button type="button" class="btn danger" @click="confirmUnitReturn">Devolver prenómina</button>
      </template>
    </UstaModal>

    <UstaModal
      :open="isScheduleModalOpen"
      title="Cronograma del proceso"
      :subtitle="`Fechas de referencia para el periodo ${store.activePeriod}.`"
      @close="isScheduleModalOpen = false"
    >
      <div
        v-for="phase in scheduleDrafts"
        :key="phase.id"
        style="display: grid; grid-template-columns: 110px 1.3fr 1fr 130px; gap: 8px; align-items: end; margin-bottom: 10px; background: var(--surface-soft); padding: 10px; border-radius: 8px; border: 1px solid var(--border)"
      >
        <div class="field" style="margin: 0">
          <label>Etiqueta</label>
          <input v-model="phase.label" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label>Etapa</label>
          <input v-model="phase.title" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label>Fechas</label>
          <input v-model="phase.dateRange" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label>Estado</label>
          <select v-model="phase.status">
            <option value="Completada">Completada</option>
            <option value="Activa">Activa</option>
            <option value="Programada">Programada</option>
          </select>
        </div>
      </div>

      <template #actions>
        <button type="button" class="btn primary" @click="handleSaveSchedule">
          Guardar cambios
        </button>
      </template>
    </UstaModal>
  </div>
</template>
