<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
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
    scheduleDrafts.value = structuredClone(store.schedulePhases);
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
  const pending = store.units.filter(
    (u) => u.payrollStatus === 'Borrador' || u.payrollStatus === 'Devuelta con Observaciones',
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
    pending,
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

function confirmUnitReturn() {
  if (!unitToReturn.value) return;
  store.changePayrollStatus(
    unitToReturn.value.id,
    'Devuelta con Observaciones',
    returnObservations.value || 'Observaciones registradas en jornada de revisión de prenómina.',
  );
  unitToReturn.value = null;
  returnObservations.value = '';
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
  store.showToast(
    'Consolidado Maestro Seccional (.xlsx con 5 hojas para SAC) descargado exitosamente',
  );
}
</script>

<template>
  <div>
    <!-- COMPACT HEADER -->
    <div class="page-top">
      <div>
        <div class="eyebrow-tag" style="margin-bottom: 3px">
          DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE · SECCIONAL TUNJA · {{ store.activePeriod }}
        </div>
        <h1 class="screen-title" style="margin: 0; font-size: 22px">
          Tablero de Control y Bandeja de Prenóminas Académicas
        </h1>
      </div>
      <div class="page-actions">
        <button
          class="btn accent small"
          :title="`Exporta el libro Excel maestro de toda la Seccional Tunja (${store.units.length} unidades, Sábana SAC, Avales, Investigación y Bitácora)`"
          @click="handleExportSectionalConsolidated"
        >
          ↓ Exportar Consolidado Seccional (.xlsx)
        </button>
        <button class="btn ghost small" @click="router.push('/director/organization')">
          + Decanos y Programas
        </button>
        <button class="btn ghost small" @click="router.push('/director/catalog')">
          ⚙ Configurar Catálogo y Topes (ANEXOS 4, 5 y 6)
        </button>
        <button class="btn primary small" @click="router.push('/vice-rector/approvals')">
          Pre-Avales V.A. ({{ kpis.pendingVaApprovals }} pendientes)
        </button>
      </div>
    </div>

    <!-- EXECUTIVE KPI STRIP -->
    <div class="grid cols-4" style="margin-bottom: 16px; gap: 12px">
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px">{{ kpis.approved }} / {{ kpis.total }}</div>
        <div class="lbl">Unidades con prenómina avalada</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--blue)">{{ kpis.inReview }}</div>
        <div class="lbl">En jornada de revisión / Enviadas</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--warning)">{{ kpis.pending }}</div>
        <div class="lbl">En borrador o devueltas con ajustes</div>
      </div>
      <div class="card stat" style="padding: 14px 18px">
        <div class="num" style="font-size: 24px; color: var(--navy)">
          {{ kpis.totalSectionalTeachers }} doc.
        </div>
        <div class="lbl">
          {{ kpis.totalSectionalHours.toLocaleString('es-CO') }} h/mes proyectadas en seccional
        </div>
      </div>
    </div>

    <!-- OFFICIAL PROCESS SCHEDULE STRIP (RF-38) -->
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
        class="btn ghost small"
        style="padding: 3px 8px; font-size: 11px"
        title="Configurar fechas del cronograma semestral (RF-38)"
        @click="isScheduleModalOpen = true"
      >
        ✎ Cronograma
      </button>
    </div>

    <!-- TABS -->
    <div class="tabs" style="margin-bottom: 14px">
      <button
        class="tab"
        :class="{ active: activeTab === 'inbox' }"
        @click="activeTab = 'inbox'"
      >
        1. Bandeja de Unidades Académicas ({{ store.units.length }})
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'analytics' }"
        @click="activeTab = 'analytics'"
      >
        2. Analítica de Horas por Función Sustantiva
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'audit' }"
        @click="activeTab = 'audit'"
      >
        3. Bitácora de Auditoría y Versiones ({{ store.auditLogs.length }})
      </button>
    </div>

    <!-- TAB 1: ACADEMIC UNITS INBOX -->
    <ExecutiveUnitsInboxTab
      v-if="activeTab === 'inbox'"
      @open-review="openFacultyReview"
      @return-unit="(unit) => (unitToReturn = unit)"
    />

    <!-- TAB 2: SECTIONAL ANALYTICS -->
    <SectionalAnalyticsPanel v-else-if="activeTab === 'analytics'" />

    <!-- TAB 3: AUDIT LOG -->
    <AuditLogPanel v-else />

    <!-- Return Payroll Modal -->
    <UstaModal
      :open="!!unitToReturn"
      title="Devolver Prenómina con Observaciones"
      @close="unitToReturn = null"
    >
      <template v-if="unitToReturn">
        <p class="sub" style="margin-top: 0">
          Se devolverá la prenómina de <b>{{ unitToReturn.name }}</b> a
          <b>{{ unitToReturn.deanName }}</b> para que realice los ajustes solicitados.
        </p>
        <div class="field">
          <label>Observaciones generales de la Directora</label>
          <textarea
            v-model="returnObservations"
            rows="5"
            style="min-height: 150px"
            placeholder="Ej: Ajustar las horas faltantes en Gestión de Graduados (20502) según ANEXO 6 y completar la solicitud de pre-aval del código 10212…"
          ></textarea>
        </div>
      </template>
      <template #actions>
        <button class="btn ghost" @click="unitToReturn = null">Cancelar</button>
        <button class="btn danger" @click="confirmUnitReturn">Devolver al Decano</button>
      </template>
    </UstaModal>

    <!-- Configure Schedule Modal (RF-38) -->
    <UstaModal
      :open="isScheduleModalOpen"
      title="Configurar Cronograma Oficial del Proceso (RF-38)"
      :subtitle="`Define las fechas y estados de cada fase para el periodo académico ${store.activePeriod}.`"
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
          <label>Fase del Proceso</label>
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
        <button class="btn primary" @click="handleSaveSchedule">
          Guardar Cronograma
        </button>
      </template>
    </UstaModal>
  </div>
</template>
