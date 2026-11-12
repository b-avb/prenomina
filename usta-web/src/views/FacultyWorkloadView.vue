<script setup lang="ts">
/**
 * Primary faculty pre-payroll workspace supporting per-teacher SAC allocation, Annex 2 matrix
 * editing, version-1 comparison, cap exception justification, and Annex 3 pre-approval authoring.
 */
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { cloneState } from '@/composables/useMutation';
import { usePayrollStore } from '@/stores/payroll.store';
import type { AllocationProgramRef } from '@/stores/workload.store';
import { exportFacultyAnnex2Xlsx, importAnnex2FromXlsx } from '@/services/exporters';
import type { FacultyTeacher, SacCode } from '@usta/domain';
import { eventChecked, eventValue } from '@/utils/dom-events';
import UstaModal from '@/components/ui/UstaModal.vue';
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

const selectableUnits = computed(() => {
  if (store.activeRole === 'dean') {
    const allowed = new Set(store.managedUnitIds);
    return store.units.filter((u) => allowed.has(u.id));
  }
  return store.units;
});

const canEditWorkload = computed<boolean>(() => {
  if (store.activeRole === 'director' || store.activeRole === 'vice_rector') {
    return true;
  }
  if (store.activeRole === 'dean') {
    // Deans may edit only managed units while the pre-payroll is in Draft or Returned status.
    const status = store.activeUnit.payrollStatus;
    const isEditableStatus =
      status === 'Borrador' || status === 'Devuelta con Observaciones';
    const isAllowedUnit =
      store.managedUnitIds.length === 0 ||
      store.managedUnitIds.includes(store.activeUnit.id);
    return isEditableStatus && isAllowedUnit;
  }
  return false;
});

const readonlyBannerMessage = computed<string | null>(() => {
  if (canEditWorkload.value) return null;
  if (store.activeRole === 'research') {
    return 'Modo de consulta: las horas de investigación y SICDDI se gestionan en el módulo Investigación.';
  }
  if (store.activeRole === 'dean') {
    const status = store.activeUnit.payrollStatus;
    if (status === 'Enviada') {
      return 'Prenómina enviada a revisión. Si requiere hacer ajustes antes de que inicie la revisión, utilice "Retirar envío".';
    }
    if (status === 'En Revisión') {
      return 'Prenómina en revisión por la Dirección de Enseñanza y Aprendizaje.';
    }
    if (status === 'Avalada') {
      return 'Prenómina avalada para el periodo activo.';
    }
  }
  return 'Modo de solo consulta.';
});

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

function tryAssignHoursWithCapControl(
  definition: SacCode,
  requestedHours: number,
  programInfo?: AllocationProgramRef,
) {
  if (!canEditWorkload.value || !activeTeacher.value) return;
  if (definition.lockedByResearch && store.activeRole === 'dean') {
    store.showToast(
      `El código ${definition.code} lo asigna exclusivamente la Dirección de Investigación`,
      'error',
    );
    return;
  }
  const existing = activeTeacher.value.allocations[definition.code];
  const effectiveProgramId =
    programInfo !== undefined ? programInfo.programId ?? null : existing?.programId ?? null;
  const selectedProgram = effectiveProgramId
    ? store.programQuotas.find((p) => p.id === effectiveProgramId) ?? null
    : null;

  const hours = Math.max(0, Number(requestedHours) || 0);
  const cap = store.getEffectiveCodeCap(definition, store.activeUnit, selectedProgram);

  if (hours > 0 && cap !== null && hours > cap) {
    // Blocking caps clamp immediately for Deans; justifiable caps open the 3-step exception modal.
    if (definition.severity === 'blocking' && store.activeRole === 'dean') {
      void store.updateCodeAllocation(
        activeTeacher.value.id,
        definition.code,
        cap,
        undefined,
        undefined,
        programInfo,
      );
      store.showToast(
        `Tope máximo en ${definition.code}: no se permite superar ${cap} h/mes${selectedProgram ? ` en ${selectedProgram.programName}` : ''}. Se ajustó a ${cap} h.`,
        'error',
      );
      return;
    }
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
      ...(programInfo !== undefined
        ? {
            programId: programInfo.programId ?? null,
            programName: programInfo.programName ?? null,
          }
        : {}),
    };
    return;
  }

  void store.updateCodeAllocation(
    activeTeacher.value.id,
    definition.code,
    hours,
    undefined,
    undefined,
    programInfo,
  );
}

function openExceptionModal(codeItem: SacCode) {
  if (!canEditWorkload.value || !activeTeacher.value) return;
  const existing = activeTeacher.value.allocations[codeItem.code];
  const currentHours = existing?.hours ?? 0;
  const selectedProgram = existing?.programId
    ? store.programQuotas.find((p) => p.id === existing.programId) ?? null
    : null;
  const cap = store.getEffectiveCodeCap(codeItem, store.activeUnit, selectedProgram);
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

const isTeacherModalOpen = ref(false);
const editingTeacherModel = ref<FacultyTeacher | null>(null);
const teacherToDelete = ref<FacultyTeacher | null>(null);
const isDeletingTeacher = ref(false);

function openNewTeacherModal() {
  if (!canEditWorkload.value) return;
  editingTeacherModel.value = null;
  isTeacherModalOpen.value = true;
}

function openEditTeacherModal() {
  if (!canEditWorkload.value || !activeTeacher.value) return;
  editingTeacherModel.value = activeTeacher.value;
  isTeacherModalOpen.value = true;
}

function promptRemoveCurrentTeacher() {
  if (!canEditWorkload.value || !activeTeacher.value) return;
  teacherToDelete.value = activeTeacher.value;
}

async function confirmRemoveTeacher(): Promise<void> {
  if (!teacherToDelete.value) return;
  isDeletingTeacher.value = true;
  try {
    const idToRemove = teacherToDelete.value.id;
    const res = await store.removeFacultyTeacher(idToRemove);
    if (res.ok) {
      teacherToDelete.value = null;
      activeTeacherId.value = store.activeUnitTeachers[0]?.id ?? '';
    }
  } finally {
    isDeletingTeacher.value = false;
  }
}

const annex3ModalState = ref<Annex3ModalState | null>(null);

function getTeacherCodeApprovalStatus(teacherId: string, code: string) {
  return store.approvalRequests.find((r) => r.teacherId === teacherId && r.code === code);
}

function openAnnex3ApprovalModal(codeItem: SacCode) {
  if (!canEditWorkload.value || !activeTeacher.value) return;
  const existing = getTeacherCodeApprovalStatus(activeTeacher.value.id, codeItem.code);
  const defaultFactor =
    codeItem.code === '10212'
      ? 4
      : codeItem.code === '20223' || codeItem.code === '20120'
        ? 2
        : codeItem.baseHours ?? 8;
  annex3ModalState.value = {
    codeItem,
    programName:
      existing?.programName ??
      activeTeacher.value.allocations[codeItem.code]?.programName ??
      store.activeUnit.name,
    attachmentUrl: existing?.attachmentUrl ?? '',
    rows: existing?.projectDetails?.length
      ? cloneState(existing.projectDetails)
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
  store.showToast(`Prenómina de ${store.activeUnit.name} descargada`);
}

async function handleImportExcelFile(event: Event) {
  if (!canEditWorkload.value) return;
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const imported = await importAnnex2FromXlsx(file, store.sacCodes);
    if (imported.length === 0) {
      store.showToast('El archivo no contiene registros docentes válidos', 'error');
      return;
    }
    const res = await store.importUnitTeachers(store.activeUnit.id, file.name, imported);
    if (res.ok) {
      activeTeacherId.value = res.data[0]?.id ?? '';
    }
  } catch (err) {
    store.showToast(
      err instanceof Error ? err.message : 'No se pudo leer el archivo Excel',
      'error',
    );
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <div>
    <div class="page-top" style="margin-bottom: 14px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div>
          <div class="eyebrow-tag" style="margin-bottom: 4px">
            {{ store.activeUnit.division }} · {{ store.activeUnit.deanName }}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
            <select
              v-if="selectableUnits.length > 1"
              :value="store.activeUnitId"
              aria-label="Seleccionar unidad académica"
              class="unit-title-select"
              @change="store.selectUnit(eventValue($event))"
            >
              <option v-for="unit in selectableUnits" :key="unit.id" :value="unit.id">
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
                    : store.activeUnit.payrollStatus === 'Borrador'
                      ? 'retirado'
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
            type="button"
            :class="{ active: viewMode === 'teacher' }"
            @click="viewMode = 'teacher'"
          >
            Por docente
          </button>
          <button
            type="button"
            :class="{ active: viewMode === 'matrix' }"
            @click="viewMode = 'matrix'"
          >
            Sábana Anexo 2
          </button>
        </div>

        <label
          class="toggle"
          style="background: #fff; padding: 5px 10px; border-radius: 8px; border: 1.5px solid var(--border)"
          title="Comparar las horas actuales frente a la versión inicial enviada"
        >
          <input
            :checked="store.versionComparisonMode"
            type="checkbox"
            @change="store.setVersionComparisonMode(eventChecked($event))"
          />
          <span class="toggle__track"></span>
          <span style="font-size: 11.5px; font-weight: 700; color: var(--navy)">
            Comparar versión inicial
          </span>
        </label>

        <input
          v-if="canEditWorkload"
          ref="excelFileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          style="display: none"
          @change="handleImportExcelFile"
        />
        <button
          v-if="canEditWorkload"
          type="button"
          class="btn ghost small"
          title="Importar sábana Anexo 2 (.xlsx)"
          @click="excelFileInput?.click()"
        >
          Importar
        </button>

        <button
          type="button"
          class="btn ghost small"
          title="Descargar prenómina Anexo 2 (.xlsx)"
          @click="handleExportAnnex2Xlsx"
        >
          Exportar
        </button>

        <button
          v-if="
            store.activeRole === 'dean' &&
            (store.activeUnit.payrollStatus === 'Borrador' ||
              store.activeUnit.payrollStatus === 'Devuelta con Observaciones')
          "
          type="button"
          class="btn primary small"
          @click="
            store.changePayrollStatus(
              store.activeUnit.id,
              'Enviada',
              'Enviada por decanatura para revisión',
            )
          "
        >
          Enviar prenómina
        </button>
        <button
          v-else-if="
            store.activeRole === 'dean' &&
            store.activeUnit.payrollStatus === 'Enviada'
          "
          type="button"
          class="btn ghost small"
          title="Volver a borrador para realizar ajustes"
          @click="
            store.changePayrollStatus(
              store.activeUnit.id,
              'Borrador',
              'Envío retirado por decanatura para ajustes',
            )
          "
        >
          Retirar envío
        </button>
        <button
          v-else-if="
            (store.activeRole === 'director' || store.activeRole === 'vice_rector') &&
            store.activeUnit.payrollStatus !== 'Avalada'
          "
          type="button"
          class="btn accent small"
          @click="
            store.changePayrollStatus(
              store.activeUnit.id,
              'Avalada',
              store.activeRole === 'vice_rector'
                ? 'Avalada por Vicerrectoría Académica'
                : 'Avalada por Dirección de Enseñanza y Aprendizaje',
            )
          "
        >
          Avalar prenómina
        </button>
      </div>
    </div>

    <div
      v-if="readonlyBannerMessage"
      class="validation-banner info"
      style="margin-bottom: 12px"
    >
      <div>{{ readonlyBannerMessage }}</div>
    </div>

    <Annex5QuotaStrip
      :bags="store.activeUnitBagIndicators"
      :active-code="bagCodeFilter"
      @select="toggleBagFilter"
    />

    <div v-if="viewMode === 'teacher'" class="prenomina-workspace">
      <TeacherSidebarPanel
        v-model:search-query="teacherSearchQuery"
        v-model:status-filter="teacherStatusFilter"
        v-model:bag-code-filter="bagCodeFilter"
        :filtered-teachers="filteredTeachers"
        :total-unit-teachers="store.activeUnitTeachers.length"
        :active-teacher-id="activeTeacher?.id ?? null"
        :readonly="!canEditWorkload"
        @select-teacher="(id) => (activeTeacherId = id)"
        @new-teacher="openNewTeacherModal"
      />

      <section v-if="activeTeacher" style="min-width: 0">
        <TeacherSummaryCard
          :teacher="activeTeacher"
          :active-codes-count="activeTeacherCodes.length"
          :alerts="activeTeacherAlerts"
          :readonly="!canEditWorkload"
          @edit-profile="openEditTeacherModal"
          @remove-teacher="promptRemoveCurrentTeacher"
          @open-annex3="openAnnex3ApprovalModal"
          @open-exception="openExceptionModal"
        />

        <div class="docente-split-grid">
          <TeacherAcademicSpacesCard
            :teacher="activeTeacher"
            :readonly="!canEditWorkload"
          />

          <TeacherSacCodesCard
            :teacher="activeTeacher"
            :assignable-codes="assignableCodes"
            :active-teacher-codes="activeTeacherCodes"
            :readonly="!canEditWorkload"
            @assign-hours="tryAssignHoursWithCapControl"
            @open-annex3="openAnnex3ApprovalModal"
            @open-exception="openExceptionModal"
          />
        </div>
      </section>

      <section v-else class="card" style="padding: 32px; text-align: center">
        <b style="color: var(--navy); display: block; margin-bottom: 6px">
          Sin docentes registrados en esta unidad
        </b>
        <p class="empty-note" style="margin: 0">
          {{
            canEditWorkload
              ? 'Agregue docentes manualmente o importe el archivo Excel del periodo.'
              : 'Esta unidad aún no registra docentes en el periodo activo.'
          }}
        </p>
      </section>
    </div>

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

    <UstaModal
      :open="Boolean(teacherToDelete)"
      title="Retirar docente"
      :subtitle="`¿Retirar a ${teacherToDelete?.fullName ?? ''} (CC ${teacherToDelete?.documentId ?? ''}) de ${store.activeUnit.name}?`"
      @close="teacherToDelete = null"
    >
      <p style="font-size: 12.5px; color: var(--ink-soft); margin: 0">
        Se eliminarán sus espacios académicos y horas asignadas en el periodo {{ store.activePeriod }}.
      </p>
      <template #footer>
        <button type="button" class="btn ghost" @click="teacherToDelete = null">
          Cancelar
        </button>
        <button
          type="button"
          class="btn danger"
          :disabled="isDeletingTeacher"
          @click="confirmRemoveTeacher"
        >
          {{ isDeletingTeacher ? 'Retirando…' : 'Retirar docente' }}
        </button>
      </template>
    </UstaModal>
  </div>
</template>
