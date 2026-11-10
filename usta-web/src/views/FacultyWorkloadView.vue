<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePayrollStore } from '@/stores/payroll.store';
import { exportFacultyAnnex2Xlsx, importAnnex2FromXlsx } from '@/services/exporters';
import type { FacultyTeacher, SacCode } from '@usta/domain';
import { eventChecked, eventValue } from '@/utils/dom-events';
import Annex5QuotaStrip from '@/components/domain/Annex5QuotaStrip.vue';
import TeacherSidebarPanel from '@/components/domain/TeacherSidebarPanel.vue';
import TeacherSummaryCard from '@/components/domain/TeacherSummaryCard.vue';
import TeacherAcademicSpacesCard from '@/components/domain/TeacherAcademicSpacesCard.vue';
import TeacherSacCodesCard from '@/components/domain/TeacherSacCodesCard.vue';
import Annex2MatrixSheet from '@/components/domain/Annex2MatrixSheet.vue';
import TeacherProfileModal from '@/components/domain/TeacherProfileModal.vue';
import QuotaExceptionModal, {
  type ExceptionModalState,
} from '@/components/domain/QuotaExceptionModal.vue';
import Annex3ApprovalModal, {
  type Annex3ModalState,
} from '@/components/domain/Annex3ApprovalModal.vue';

const store = usePayrollStore();
const route = useRoute();

const viewMode = ref<'teacher' | 'matrix'>('teacher');
const teacherSearchQuery = ref('');
const teacherStatusFilter = ref<'all' | 'alerts' | 'ok'>('all');
const bagCodeFilter = ref<string | null>(null);

function resolveInitialTeacherId(): string {
  const queryId = typeof route.query.teacherId === 'string' ? route.query.teacherId : '';
  const queryDocumentId =
    typeof route.query.documentId === 'string' ? route.query.documentId : '';
  if (queryId) {
    const found = store.activeUnitTeachers.find((t) => t.id === queryId);
    if (found) return found.id;
  }
  if (queryDocumentId) {
    const found = store.activeUnitTeachers.find((t) => t.documentId === queryDocumentId);
    if (found) return found.id;
  }
  return store.activeUnitTeachers[0]?.id ?? '';
}

const activeTeacherId = ref<string>(resolveInitialTeacherId());

watch(
  () => [store.activeUnitId, route.query.teacherId, route.query.documentId],
  () => {
    bagCodeFilter.value = null;
    activeTeacherId.value = resolveInitialTeacherId();
  },
);

const assignableCodes = computed(() =>
  store.sacCodes.filter((c) => c.code !== '40104' && c.code !== '40108'),
);

function toggleBagFilter(code: string) {
  bagCodeFilter.value = bagCodeFilter.value === code ? null : code;
}

const filteredTeachers = computed(() => {
  const query = teacherSearchQuery.value.trim().toLowerCase();
  return store.activeUnitTeachers.filter((teacher) => {
    const matchesText =
      !query ||
      teacher.fullName.toLowerCase().includes(query) ||
      teacher.documentId.toLowerCase().includes(query);
    if (!matchesText) return false;

    if (bagCodeFilter.value) {
      const hours = teacher.allocations[bagCodeFilter.value]?.hours ?? 0;
      if (hours <= 0) return false;
    }

    if (teacherStatusFilter.value === 'alerts') {
      return store
        .validateTeacher(teacher)
        .some((a) => a.severity === 'blocking' || a.severity === 'alert');
    }
    if (teacherStatusFilter.value === 'ok') {
      return (
        store.computeTeacherTotalHours(teacher) === teacher.expectedWorkload &&
        !store.validateTeacher(teacher).some((a) => a.severity === 'blocking')
      );
    }
    return true;
  });
});

const activeTeacher = computed<FacultyTeacher | undefined>(
  () =>
    store.activeUnitTeachers.find((t) => t.id === activeTeacherId.value) ??
    filteredTeachers.value[0] ??
    store.activeUnitTeachers[0],
);

const activeTeacherAlerts = computed(() =>
  activeTeacher.value ? store.validateTeacher(activeTeacher.value) : [],
);

const activeTeacherCodes = computed(() => {
  if (!activeTeacher.value) return [];
  const teacher = activeTeacher.value;
  return assignableCodes.value.filter((codeItem) => {
    const currentHours = teacher.allocations[codeItem.code]?.hours ?? 0;
    const version1Hours = teacher.allocations[codeItem.code]?.version1Hours ?? 0;
    return currentHours > 0 || (store.versionComparisonMode && version1Hours > 0);
  });
});

const exceptionModalState = ref<ExceptionModalState | null>(null);

function tryAssignHoursWithCapControl(definition: SacCode, requestedHours: number) {
  if (!activeTeacher.value) return;
  if (definition.lockedByResearch && store.activeRole === 'dean') {
    store.showToast(
      `El código ${definition.code} (SICDDI) es precargado exclusivamente por Dirección de Investigación`,
      'error',
    );
    return;
  }
  const hours = Math.max(0, Number(requestedHours) || 0);
  const cap = store.getEffectiveCodeCap(definition);

  if (hours > 0 && cap !== null && hours > cap) {
    if (definition.severity === 'blocking' && store.activeRole === 'dean') {
      store.updateCodeAllocation(activeTeacher.value.id, definition.code, cap);
      store.showToast(
        `⛔ Tope Bloqueante (${definition.code}): No se permite superar ${cap} h/mes en esta unidad. Se ajustó al tope máximo (${cap} h).`,
        'error',
      );
      return;
    }
    const existing = activeTeacher.value.allocations[definition.code];
    exceptionModalState.value = {
      codeItem: definition,
      hours,
      referenceCap: cap,
      exceedsCap: true,
      confirmStep1: false,
      confirmStep2: false,
      confirmStep3: false,
      justification: existing?.exceptionJustification ?? '',
      directorNote: existing?.directorNote ?? '',
    };
    return;
  }

  store.updateCodeAllocation(activeTeacher.value.id, definition.code, hours);
}

function openExceptionModal(codeItem: SacCode) {
  if (!activeTeacher.value) return;
  const existing = activeTeacher.value.allocations[codeItem.code];
  const currentHours = existing?.hours ?? 0;
  const cap = store.getEffectiveCodeCap(codeItem);
  const exceeds = cap !== null && currentHours > cap;
  exceptionModalState.value = {
    codeItem,
    hours: currentHours,
    referenceCap: cap,
    exceedsCap: exceeds,
    confirmStep1: Boolean(existing?.exceptionJustification),
    confirmStep2: Boolean(existing?.exceptionJustification),
    confirmStep3: Boolean(existing?.exceptionJustification),
    justification: existing?.exceptionJustification ?? '',
    directorNote: existing?.directorNote ?? '',
  };
}

// Teacher Profile Modal
const isTeacherModalOpen = ref(false);
const editingTeacherModel = ref<FacultyTeacher | null>(null);

function openNewTeacherModal() {
  editingTeacherModel.value = null;
  isTeacherModalOpen.value = true;
}

function openEditTeacherModal() {
  if (!activeTeacher.value) return;
  editingTeacherModel.value = activeTeacher.value;
  isTeacherModalOpen.value = true;
}

function handleRemoveCurrentTeacher() {
  if (!activeTeacher.value) return;
  const idToRemove = activeTeacher.value.id;
  store.removeFacultyTeacher(idToRemove);
  activeTeacherId.value = store.activeUnitTeachers[0]?.id ?? '';
}

// Annex 3 Approval Modal
const annex3ModalState = ref<Annex3ModalState | null>(null);

function getTeacherCodeApprovalStatus(teacherId: string, code: string) {
  return store.approvalRequests.find((r) => r.teacherId === teacherId && r.code === code);
}

function openAnnex3ApprovalModal(codeItem: SacCode) {
  if (!activeTeacher.value) return;
  const existing = getTeacherCodeApprovalStatus(activeTeacher.value.id, codeItem.code);
  const defaultFactor =
    codeItem.code === '10212'
      ? 4
      : codeItem.code === '20223' || codeItem.code === '20120'
        ? 2
        : codeItem.baseHours ?? 8;
  annex3ModalState.value = {
    codeItem,
    programName: existing?.programName ?? store.activeUnit.name,
    attachmentUrl:
      existing?.attachmentUrl ??
      `Soporte_ANEXO3_${codeItem.code}_${activeTeacher.value.documentId}.pdf`,
    rows: existing?.projectDetails?.length
      ? structuredClone(existing.projectDetails)
      : [
          {
            title: '',
            projectType:
              codeItem.code === '10212'
                ? 'Proyecto de Investigación'
                : codeItem.code === '20223' || codeItem.code === '20120'
                  ? 'Opción de Grado Social / Práctica'
                  : codeItem.code === '20222'
                    ? 'Consultorio Especializado'
                    : codeItem.code === '40222'
                      ? 'Curso / Módulo E-Learning'
                      : 'Tutoría Especializada / Extensión',
            studentsOrCourse: '',
            committeeApprovalMinute: `Acta Comité Curricular — ${store.activePeriod}`,
            hours: defaultFactor,
          },
        ],
  };
}

// Excel Export / Import
const excelFileInput = ref<HTMLInputElement | null>(null);

function handleExportAnnex2Xlsx() {
  exportFacultyAnnex2Xlsx({
    period: store.activePeriod,
    unit: store.activeUnit,
    teachers: store.activeUnitTeachers,
    sacCodes: store.sacCodes,
    computeHours40104: store.computeHours40104,
    getEffectivePse: store.getEffectivePse,
    computeTeacherTotalHours: store.computeTeacherTotalHours,
    sumCodeInUnit: store.sumCodeInUnit,
    bags: store.activeUnitBagIndicators,
  });
  store.showToast(
    `Libro Excel ANEXO 2 (.xlsx con 3 hojas) de ${store.activeUnit.name} descargado`,
  );
}

async function handleImportExcelFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const imported = await importAnnex2FromXlsx(file, store.sacCodes);
    if (imported.length === 0) {
      store.showToast('No se detectaron filas de docentes válidas en el archivo', 'error');
      return;
    }
    const res = await store.importUnitTeachers(store.activeUnit.id, file.name, imported);
    if (res.ok) {
      activeTeacherId.value = res.data[0]?.id ?? '';
    }
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'Error al leer el archivo Excel',
      'error',
    );
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div>
    <!-- INTEGRATED EXECUTIVE HEADER -->
    <div class="page-top" style="margin-bottom: 14px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div>
          <div class="eyebrow-tag" style="margin-bottom: 4px">
            {{ store.activeUnit.division }} · {{ store.activeUnit.deanName }}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
            <select
              v-if="store.currentUser?.role !== 'dean'"
              :value="store.activeUnitId"
              aria-label="Seleccionar Unidad Académica"
              style="
                font-family: var(--font-display);
                font-size: 20px;
                font-weight: 700;
                color: var(--navy);
                background: #fff;
                border: 1.5px solid var(--border);
                border-radius: 10px;
                padding: 5px 12px;
                cursor: pointer;
                box-shadow: 2px 2px 0 rgba(0, 51, 106, 0.05);
              "
              @change="store.selectUnit(eventValue($event))"
            >
              <option v-for="unit in store.units" :key="unit.id" :value="unit.id">
                {{ unit.name }} ({{ store.countUnitTeachers(unit.id) }} docentes)
              </option>
            </select>
            <h1 v-else class="screen-title" style="margin: 0; font-size: 20px">
              {{ store.activeUnit.name }} ({{ store.countUnitTeachers(store.activeUnit.id) }} docentes)
            </h1>
            <span
              class="badge"
              :class="
                store.activeUnit.payrollStatus === 'Avalada'
                  ? 'aprobado'
                  : store.activeUnit.payrollStatus === 'Devuelta con Observaciones'
                    ? 'reprobado'
                    : 'inscrito'
              "
            >
              {{ store.activeUnit.payrollStatus }} · v{{ store.activeUnit.currentVersion }}
            </span>
          </div>
        </div>
      </div>

      <div class="page-actions">
        <div class="segmented-control">
          <button
            :class="{ active: viewMode === 'teacher' }"
            @click="viewMode = 'teacher'"
          >
            Ficha por Docente
          </button>
          <button :class="{ active: viewMode === 'matrix' }" @click="viewMode = 'matrix'">
            Sábana ANEXO 2
          </button>
        </div>

        <label
          class="toggle"
          style="background: #fff; padding: 5px 10px; border-radius: 8px; border: 1.5px solid var(--border)"
          title="Compara la línea base v1 de la facultad contra los ajustes actuales de revisión"
        >
          <input
            :checked="store.versionComparisonMode"
            type="checkbox"
            @change="store.setVersionComparisonMode(eventChecked($event))"
          />
          <span class="toggle__track"></span>
          <span style="font-size: 11.5px; font-weight: 700; color: var(--navy)">
            Diff v1→v{{ Math.max(2, store.activeUnit.currentVersion) }}
          </span>
        </label>

        <input
          ref="excelFileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          style="display: none"
          @change="handleImportExcelFile"
        />
        <button
          class="btn ghost small"
          title="Importar sábana Excel (.xlsx) oficial de ANEXO 2"
          @click="excelFileInput?.click()"
        >
          ↑ Importar
        </button>

        <button
          class="btn ghost small"
          title="Exportar libro Excel (.xlsx) oficial con las 3 hojas: Proyección de Nómina, Espacios Académicos y Resumen"
          @click="handleExportAnnex2Xlsx"
        >
          ↓ Exportar .xlsx
        </button>

        <button
          v-if="store.activeRole === 'dean'"
          class="btn primary small"
          @click="
            store.changePayrollStatus(
              store.activeUnit.id,
              'Enviada',
              'Enviada por Decanatura para revisión',
            )
          "
        >
          Enviar a E&A
        </button>
        <button
          v-else-if="store.activeRole === 'director'"
          class="btn accent small"
          @click="
            store.changePayrollStatus(
              store.activeUnit.id,
              'Avalada',
              'Avalada en sesión de revisión por Directora E&A',
            )
          "
        >
          ✓ Avalar Facultad
        </button>
      </div>
    </div>

    <!-- ANNEX 5 & 6 QUOTA STRIP -->
    <Annex5QuotaStrip
      :bags="store.activeUnitBagIndicators"
      :active-code="bagCodeFilter"
      @select="toggleBagFilter"
    />

    <!-- MODE 1: TEACHER WORKSPACE -->
    <div v-if="viewMode === 'teacher'" class="prenomina-workspace">
      <TeacherSidebarPanel
        v-model:search-query="teacherSearchQuery"
        v-model:status-filter="teacherStatusFilter"
        v-model:bag-code-filter="bagCodeFilter"
        :filtered-teachers="filteredTeachers"
        :total-unit-teachers="store.activeUnitTeachers.length"
        :active-teacher-id="activeTeacher?.id ?? null"
        @select-teacher="(id) => (activeTeacherId = id)"
        @new-teacher="openNewTeacherModal"
      />

      <section v-if="activeTeacher" style="min-width: 0">
        <TeacherSummaryCard
          :teacher="activeTeacher"
          :active-codes-count="activeTeacherCodes.length"
          :alerts="activeTeacherAlerts"
          @edit-profile="openEditTeacherModal"
          @remove-teacher="handleRemoveCurrentTeacher"
          @open-annex3="openAnnex3ApprovalModal"
          @open-exception="openExceptionModal"
        />

        <div class="docente-split-grid">
          <TeacherAcademicSpacesCard :teacher="activeTeacher" />

          <TeacherSacCodesCard
            :teacher="activeTeacher"
            :assignable-codes="assignableCodes"
            :active-teacher-codes="activeTeacherCodes"
            @assign-hours="tryAssignHoursWithCapControl"
            @open-annex3="openAnnex3ApprovalModal"
            @open-exception="openExceptionModal"
          />
        </div>
      </section>
    </div>

    <!-- MODE 2: ANNEX 2 CONSOLIDATED MATRIX VIEW -->
    <Annex2MatrixSheet
      v-else
      @select-teacher="
        (id) => {
          activeTeacherId = id;
          viewMode = 'teacher';
        }
      "
      @export-excel="handleExportAnnex2Xlsx"
    />

    <!-- MODALS -->
    <TeacherProfileModal
      :open="isTeacherModalOpen"
      :editing-teacher="editingTeacherModel"
      @close="isTeacherModalOpen = false"
      @saved="(id) => (activeTeacherId = id)"
    />

    <QuotaExceptionModal
      :state="exceptionModalState"
      :teacher="activeTeacher"
      @close="exceptionModalState = null"
    />

    <Annex3ApprovalModal
      :state="annex3ModalState"
      :teacher="activeTeacher"
      @close="annex3ModalState = null"
    />
  </div>
</template>
