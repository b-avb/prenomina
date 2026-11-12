import { defineStore, storeToRefs } from 'pinia';
import type {
  CreateAcademicUnitDto,
  CreateTeacherPayload,
  FacultyTeacher,
  HourBalanceSuggestion,
  ImportedTeacherDto,
  PayrollStatus,
  UnitVersionSnapshotResponse,
  UnitWithDirectorResponse,
  UpdateUnitDeanDto,
} from '@usta/domain';
import { useAuthRole } from '@/composables/useAuthRole';
import { useMutation, type MutationResult } from '@/composables/useMutation';
import { useToast } from '@/composables/useToast';
import { unitsApi } from '@/services/api';
import { useApprovalStore } from './approval.store';
import { useAuditStore } from './audit.store';
import { useAuthStore } from './auth.store';
import { useCatalogStore } from './catalog.store';
import { useOrganizationStore } from './organization.store';
import { useResearchStore } from './research.store';
import { useStateSyncStore } from './state-sync.store';
import { useWorkloadStore } from './workload.store';

/**
 * Enterprise Domain Facade Store (GoF Facade Pattern).
 * Coordinates the single-responsibility modular stores while providing
 * a clean, 100% English unified API for views and components.
 * Cross-aggregate writes (unit + director/roster) are orchestrated here.
 */
export const usePayrollStore = defineStore('payroll', () => {
  const authStore = useAuthStore();
  const orgStore = useOrganizationStore();
  const catalogStore = useCatalogStore();
  const workloadStore = useWorkloadStore();
  const approvalStore = useApprovalStore();
  const researchStore = useResearchStore();
  const auditStore = useAuditStore();
  const syncStore = useStateSyncStore();

  const {
    currentUser,
    usersDirectory,
    isAuthenticated,
    mustChangePassword,
    activeRole,
    managedUnitIds,
    activeUnitId,
    versionComparisonMode,
  } = storeToRefs(authStore);
  const {
    activePeriod,
    availablePeriods,
    schedulePhases,
    units,
    programQuotas,
    activeUnit,
  } = storeToRefs(orgStore);
  const { sacCodes, rulesConfig } = storeToRefs(catalogStore);
  const {
    teachers,
    activeUnitTeachers,
    activeUnitBagIndicators,
    activeUnitAlerts,
  } = storeToRefs(workloadStore);
  const { approvalRequests } = storeToRefs(approvalStore);
  const { researchAllocations } = storeToRefs(researchStore);
  const { auditLogs } = storeToRefs(auditStore);
  const { backendConnected } = storeToRefs(syncStore);

  const { toasts, showToast, dismissToast } = useToast();
  const { currentUserProfile } = useAuthRole(activeRole, units, activeUnitId, currentUser);
  const { runOptimistic, runPessimistic, reject } = useMutation();

  function commitUnitWithDirector({
    unit,
    directorTeacher,
    deanUser,
  }: UnitWithDirectorResponse): void {
    orgStore.upsertUnit(unit);
    workloadStore.upsertTeacher(directorTeacher);
    if (deanUser) {
      authStore.upsertUserInDirectory(deanUser);
    }
  }

  function rejectMissingUnit<T>(): Promise<MutationResult<T>> {
    return reject('NOT_FOUND', 'La unidad académica no se encontró en el periodo activo');
  }

  function addAcademicUnit(
    payload: CreateAcademicUnitDto,
  ): Promise<MutationResult<UnitWithDirectorResponse>> {
    return runPessimistic({
      request: () => unitsApi.create(payload),
      commit: commitUnitWithDirector,
      successMessage: ({ unit }) => `Unidad "${unit.name}" creada`,
    });
  }

  function updateUnitDean(
    payload: UpdateUnitDeanDto,
  ): Promise<MutationResult<UnitWithDirectorResponse>> {
    const unit = orgStore.findUnit(payload.unitId);
    if (!unit) return rejectMissingUnit();
    return runOptimistic({
      capture: () => unit,
      apply: () => {
        unit.deanName = payload.deanName.trim();
      },
      request: () => unitsApi.updateDean(payload),
      commit: commitUnitWithDirector,
      rollback: orgStore.upsertUnit,
      successMessage: ({ unit: saved }) =>
        `Responsable de ${saved.name}: ${saved.deanName}`,
    });
  }

  function changePayrollStatus(
    unitId: string,
    nextStatus: PayrollStatus,
    note?: string,
  ): Promise<MutationResult<UnitVersionSnapshotResponse>> {
    const unit = orgStore.findUnit(unitId);
    if (!unit) return rejectMissingUnit();

    // UX pre-check only: the server enforces the same rule and its message wins on 422.
    if (nextStatus === 'Enviada' && activeRole.value === 'dean') {
      if (workloadStore.countUnitTeachers(unitId) > 0 && workloadStore.isUnitUnstarted(unitId)) {
        return reject(
          'BUSINESS_RULE_VIOLATION',
          `No se puede enviar la prenómina de ${unit.name}: aún no tiene horas registradas`,
        );
      }
      if (rulesConfig.value.blockSubmissionWithBlockingAlerts) {
        const blocking = workloadStore
          .getUnitAlerts(unitId, { enforceSubmissionReadiness: true })
          .filter((a) => a.severity === 'blocking');
        if (blocking.length > 0) {
          return reject(
            'BUSINESS_RULE_VIOLATION',
            blocking.length === 1
              ? `No se puede enviar: hay 1 alerta bloqueante en ${unit.name} (${blocking[0].title})`
              : `No se puede enviar: hay ${blocking.length} alertas bloqueantes en ${unit.name} (${blocking[0].title})`,
          );
        }
      }
    }

    return runOptimistic({
      capture: () => unit,
      apply: () => {
        unit.payrollStatus = nextStatus;
      },
      request: () =>
        unitsApi.changeStatus(activePeriod.value, {
          unitId,
          status: nextStatus,
          observation: note,
        }),
      commit: ({ unit: saved, teachers: unitTeachers }) => {
        orgStore.upsertUnit(saved);
        workloadStore.replaceUnitTeachers(saved.id, unitTeachers);
      },
      rollback: orgStore.upsertUnit,
      successMessage: ({ unit: saved }) => `Estado de ${saved.name}: ${nextStatus}`,
    });
  }

  function addFacultyTeacher(
    payload: CreateTeacherPayload,
  ): Promise<MutationResult<FacultyTeacher>> {
    return workloadStore.createTeacher(activeUnitId.value, payload);
  }

  function applyBalanceSuggestion(
    teacherId: string,
    suggestion: Pick<HourBalanceSuggestion, 'code' | 'proposedHours' | 'explanation'>,
  ): Promise<MutationResult<FacultyTeacher>> {
    if (suggestion.code === '40108') {
      return workloadStore.autoFixTeacherPse(teacherId);
    }
    return workloadStore.updateCodeAllocation(
      teacherId,
      suggestion.code,
      suggestion.proposedHours,
      `Ajuste sugerido: ${suggestion.explanation}`,
    );
  }

  function importUnitTeachers(
    unitId: string,
    fileName: string,
    importedTeachers: ImportedTeacherDto[],
  ): Promise<MutationResult<FacultyTeacher[]>> {
    return workloadStore.importRoster(unitId, fileName, importedTeachers);
  }

  return {
    // State & Computed
    activePeriod,
    availablePeriods,
    schedulePhases,
    currentUser,
    usersDirectory,
    isAuthenticated,
    mustChangePassword,
    activeRole,
    managedUnitIds,
    activeUnitId,
    versionComparisonMode,
    backendConnected,
    rulesConfig,
    sacCodes,
    units,
    programQuotas,
    teachers,
    approvalRequests,
    researchAllocations,
    auditLogs,
    toasts,
    currentUserProfile,
    activeUnit,
    activeUnitTeachers,
    activeUnitBagIndicators,
    activeUnitAlerts,

    // Session & Navigation (UI state)
    login: authStore.login,
    changePassword: authStore.changePassword,
    logout: authStore.logout,
    fetchUsersDirectory: authStore.fetchUsersDirectory,
    createUserAccount: authStore.createUserAccount,
    resetUserPassword: authStore.resetUserPassword,
    selectUnit: authStore.setActiveUnit,
    setVersionComparisonMode: authStore.setVersionComparisonMode,

    // Notifications & Periods
    showToast,
    dismissToast,
    switchPeriod: syncStore.switchPeriod,
    createPeriod: syncStore.createPeriod,

    // Calculations & Validations
    computeHours40104: workloadStore.computeHours40104,
    computeHours40006: workloadStore.computeHours40006,
    computeExactPse25: workloadStore.computeExactPse25,
    getEffectivePse: workloadStore.getEffectivePse,
    computeOtherSacHours: workloadStore.computeOtherSacHours,
    computeTeacherTotalHours: workloadStore.computeTeacherTotalHours,
    getEffectiveCodeCap: workloadStore.getEffectiveCodeCap,
    sumCodeInUnit: workloadStore.sumCodeInUnit,
    countUnitTeachers: workloadStore.countUnitTeachers,
    countPendingApprovals: approvalStore.countPendingApprovals,
    countActiveUnitAlerts: workloadStore.countActiveUnitAlerts,
    getUnitBagIndicators: workloadStore.getUnitBagIndicators,
    isTeacherUnstarted: workloadStore.isTeacherUnstarted,
    isUnitUnstarted: workloadStore.isUnitUnstarted,
    getUnitAlerts: workloadStore.getUnitAlerts,
    validateTeacher: workloadStore.validateTeacher,
    suggestTeacherHourBalance: workloadStore.suggestTeacherHourBalance,

    // Workload Mutations
    addAcademicSpace: workloadStore.addAcademicSpace,
    updateAcademicSpace: workloadStore.updateAcademicSpace,
    removeAcademicSpace: workloadStore.removeAcademicSpace,
    autoFixTeacherPse: workloadStore.autoFixTeacherPse,
    updateCodeAllocation: workloadStore.updateCodeAllocation,
    addFacultyTeacher,
    importUnitTeachers,
    updateTeacherProfile: workloadStore.updateTeacherProfile,
    removeFacultyTeacher: workloadStore.removeTeacher,
    applyBalanceSuggestion,

    // Catalog & Rules Mutations
    createSacCode: catalogStore.createSacCode,
    updateSacCode: async (
      code: string,
      patch: Parameters<typeof catalogStore.updateSacCode>[1],
      successMessage?: string,
    ) => {
      const res = await catalogStore.updateSacCode(code, patch, successMessage);
      if (res.ok && res.data.code !== code) {
        const nextCode = res.data.code;
        for (const teacher of teachers.value) {
          const allocation = teacher.allocations[code];
          if (allocation) {
            delete teacher.allocations[code];
            teacher.allocations[nextCode] = { ...allocation, code: nextCode };
          }
        }
        for (const req of approvalRequests.value) {
          if (req.code === code) req.code = nextCode;
        }
        for (const item of researchAllocations.value) {
          if (item.code === code) item.code = nextCode;
        }
      }
      return res;
    },
    deleteSacCode: catalogStore.deleteSacCode,
    importSacCodes: catalogStore.importSacCodes,
    updateRulesConfig: catalogStore.updateRulesConfig,
    saveSchedulePhases: orgStore.saveSchedulePhases,

    // Organization Mutations
    addAcademicUnit,
    updateUnit: orgStore.updateUnit,
    updateUnitDean,
    changePayrollStatus,
    createProgram: orgStore.createProgram,
    updateProgram: orgStore.updateProgram,
    removeProgram: orgStore.removeProgram,

    // Approvals & Research Mutations
    uploadApprovalAttachment: approvalStore.uploadApprovalAttachment,
    openApprovalAttachment: approvalStore.openApprovalAttachment,
    registerApprovalRequest: approvalStore.registerApprovalRequest,
    decideApprovalRequest: approvalStore.decideApprovalRequest,
    registerResearchAllocation: researchStore.registerResearchAllocation,
    updateResearchAllocation: researchStore.updateResearchAllocation,
    removeResearchAllocation: researchStore.removeResearchAllocation,
  };
});
