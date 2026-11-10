import type {
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  AssignedAcademicSpace,
  AuditLogEntry,
  BusinessRulesConfig,
  FacultySpecificRule,
  FacultyTeacher,
  PayrollRole,
  ProgramQuotaAnnex5,
  ResearchAllocationAnnex7,
  RuleSeverity,
  SacCode,
  SchedulePhase,
  TeacherCodeAllocation,
} from '@usta/domain';
import {
  ACADEMIC_LEVELS,
  ANNEX3_FORMATS,
  APPROVAL_STATUSES,
  isOneOf,
  PAYROLL_STATUSES,
  PHASE_STATUSES,
  PROGRAM_MODALITIES,
  SICDDI_LEVELS,
  SUBSTANTIVE_FUNCTIONS,
  TEACHER_DEDICATIONS,
  UNIT_TYPES,
} from '../validation/domain-enums.js';

export interface LegacyImportedState {
  activePeriod: string;
  availablePeriods: string[];
  schedulePhases?: SchedulePhase[];
  activeRole?: PayrollRole;
  activeUnitId?: string;
  rulesConfig: BusinessRulesConfig;
  sacCodes: SacCode[];
  units: AcademicUnitSummary[];
  programQuotas: ProgramQuotaAnnex5[];
  teachers: FacultyTeacher[];
  approvalRequests: ApprovalRequestAnnex3[];
  researchAllocations: ResearchAllocationAnnex7[];
  auditLogs: AuditLogEntry[];
  updatedAt?: string;
}

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick(raw: RawRecord, primaryKey: string, legacyKey?: string): unknown {
  if (raw[primaryKey] !== undefined) return raw[primaryKey];
  if (legacyKey && raw[legacyKey] !== undefined) return raw[legacyKey];
  return undefined;
}

function readStr(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
  fallback = '',
): string {
  const val = pick(raw, primaryKey, legacyKey);
  return val !== undefined && val !== null ? String(val) : fallback;
}

function readOptStr(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
): string | undefined {
  const val = pick(raw, primaryKey, legacyKey);
  return typeof val === 'string' ? val : undefined;
}

function readNum(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
  fallback = 0,
): number {
  const val = pick(raw, primaryKey, legacyKey);
  if (val === undefined || val === null) return fallback;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readOptNum(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
): number | undefined {
  const val = pick(raw, primaryKey, legacyKey);
  if (val === undefined || val === null) return undefined;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readNullableNum(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
): number | null {
  const val = pick(raw, primaryKey, legacyKey);
  if (val === undefined || val === null) return null;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : null;
}

function readBool(
  raw: RawRecord,
  primaryKey: string,
  legacyKey?: string,
  fallback = false,
): boolean {
  const val = pick(raw, primaryKey, legacyKey);
  return val !== undefined ? Boolean(val) : fallback;
}

function readEnum<T extends string>(
  raw: RawRecord,
  primaryKey: string,
  legacyKey: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const val = pick(raw, primaryKey, legacyKey);
  return isOneOf(val, allowed) ? val : fallback;
}

function mapSeverity(raw: string | undefined): RuleSeverity {
  if (raw === 'bloqueante' || raw === 'blocking') return 'blocking';
  if (raw === 'informativa' || raw === 'informative') return 'informative';
  return 'justifiable_alert';
}

function mapRole(raw: string | undefined): PayrollRole {
  if (raw === 'decano' || raw === 'dean') return 'dean';
  if (raw === 'vicerrector' || raw === 'vice_rector') return 'vice_rector';
  if (raw === 'investigacion' || raw === 'research') return 'research';
  return 'director';
}

export function normalizeSacCode(raw: RawRecord): SacCode {
  const rawRules = pick(raw, 'facultyRules', 'reglasPorFacultad');
  const facultyRules: FacultySpecificRule[] | undefined = Array.isArray(rawRules)
    ? rawRules.filter(isRecord).map((r) => {
        const facultyBagCap = readOptNum(r, 'facultyBagCap', 'topeBolsaFacultad');
        return {
          unitId: readStr(r, 'unitId', 'facultadId'),
          unitName: readStr(r, 'unitName', 'facultadNombre'),
          minTeacherHours: readNullableNum(r, 'minTeacherHours', 'minHorasDocente'),
          maxTeacherHours: readNullableNum(r, 'maxTeacherHours', 'maxHorasDocente'),
          ...(facultyBagCap !== undefined ? { facultyBagCap } : {}),
        };
      })
    : undefined;

  const postgraduateCapRaw = pick(raw, 'postgraduateCapHours', 'topeConPosgrado');
  const psePercentage = readOptNum(raw, 'psePercentage', 'porcentajePse');
  const hoursPerUnitFactor = readOptNum(raw, 'hoursPerUnitFactor', 'factorPorUnidad');
  const unitLabel = readOptStr(raw, 'unitLabel', 'etiquetaUnidad');
  const annex3FormatRaw = pick(raw, 'annex3Format', 'formatoAnexo3');
  const annex3Format = isOneOf(annex3FormatRaw, ANNEX3_FORMATS)
    ? annex3FormatRaw
    : undefined;

  return {
    code: readStr(raw, 'code', 'codigo'),
    name: readStr(raw, 'name', 'nombre'),
    substantiveFunction: readEnum(
      raw,
      'substantiveFunction',
      'funcion',
      SUBSTANTIVE_FUNCTIONS,
      'Enseñanza-Aprendizaje',
    ),
    definition: readStr(raw, 'definition', 'definicion'),
    guideline: readStr(raw, 'guideline', 'lineamiento'),
    baseHours: readNullableNum(raw, 'baseHours', 'baseHoras'),
    capHours: readNullableNum(raw, 'capHours', 'topeHoras'),
    ...(postgraduateCapRaw !== undefined
      ? { postgraduateCapHours: readNullableNum(raw, 'postgraduateCapHours', 'topeConPosgrado') }
      : {}),
    ...(psePercentage !== undefined ? { psePercentage } : {}),
    ...(hoursPerUnitFactor !== undefined ? { hoursPerUnitFactor } : {}),
    ...(unitLabel !== undefined ? { unitLabel } : {}),
    requiresViceRectorApproval: readBool(raw, 'requiresViceRectorApproval', 'requiereAvalVA'),
    ...(annex3Format !== undefined ? { annex3Format } : {}),
    appliesTo: readStr(raw, 'appliesTo', 'aplicaA'),
    severity: mapSeverity(readOptStr(raw, 'severity', 'severidad')),
    ...(pick(raw, 'mandatoryInFaculty', 'obligatorioFacultad') !== undefined
      ? { mandatoryInFaculty: readBool(raw, 'mandatoryInFaculty', 'obligatorioFacultad') }
      : {}),
    ...(pick(raw, 'lockedByResearch', 'bloqueadoInvestigacion') !== undefined
      ? { lockedByResearch: readBool(raw, 'lockedByResearch', 'bloqueadoInvestigacion') }
      : {}),
    ...(facultyRules ? { facultyRules } : {}),
  };
}

export function normalizeProgramQuota(raw: RawRecord): ProgramQuotaAnnex5 {
  const qualityNotes = readOptStr(raw, 'qualityNotes', 'obsCalidad');
  const curriculumNotes = readOptStr(raw, 'curriculumNotes', 'obsCurriculo');
  return {
    id: readStr(raw, 'id'),
    unitId: readStr(raw, 'unitId', 'facultadId'),
    unitName: readStr(raw, 'unitName', 'facultadNombre'),
    programName: readStr(raw, 'programName', 'programa'),
    level: readEnum(raw, 'level', 'nivel', ACADEMIC_LEVELS, 'Pregrado'),
    modality: readEnum(raw, 'modality', 'modalidad', PROGRAM_MODALITIES, 'Presencial'),
    accreditationStatus: readStr(raw, 'accreditationStatus', 'estadoAcreditacion'),
    quality30411: readNum(raw, 'quality30411', 'calidad30411'),
    ...(qualityNotes !== undefined ? { qualityNotes } : {}),
    curriculum40106: readNum(raw, 'curriculum40106', 'curriculo40106'),
    ...(curriculumNotes !== undefined ? { curriculumNotes } : {}),
    sea40109: readNum(raw, 'sea40109'),
    saberPro40127: readNum(raw, 'saberPro40127'),
    isActive: readBool(raw, 'isActive', 'condicionActiva', true),
  };
}

export function normalizeAcademicUnit(raw: RawRecord): AcademicUnitSummary {
  return {
    id: readStr(raw, 'id'),
    name: readStr(raw, 'name', 'nombre'),
    division: readStr(raw, 'division'),
    unitType: readEnum(raw, 'unitType', 'tipo', UNIT_TYPES, 'Facultad'),
    hasPostgraduates: readBool(raw, 'hasPostgraduates', 'tienePosgrados'),
    deanName: readStr(raw, 'deanName', 'decanoNombre'),
    payrollStatus: readEnum(
      raw,
      'payrollStatus',
      'estadoPrenomina',
      PAYROLL_STATUSES,
      'Borrador',
    ),
    currentVersion: readNum(raw, 'currentVersion', 'versionActual', 1),
    updatedAt: readStr(raw, 'updatedAt', 'fechaActualizacion'),
    qualityCap30411: readNum(raw, 'qualityCap30411', 'topeCalidad30411'),
    curriculumCap40106: readNum(raw, 'curriculumCap40106', 'topeCurriculo40106'),
    seaCap40109: readNum(raw, 'seaCap40109', 'topeSea40109'),
    saberProCap40127: readNum(raw, 'saberProCap40127', 'topeSaberPro40127'),
    graduatesCap20502: readNum(raw, 'graduatesCap20502', 'topeGraduados20502'),
    totalTeachers: readNum(raw, 'totalTeachers', 'totalDocentes'),
    pendingAlerts: readNum(raw, 'pendingAlerts', 'alertasPendientes'),
    pendingApprovals: readNum(raw, 'pendingApprovals', 'avalesPendientes'),
  };
}

export function normalizeTeacher(raw: RawRecord): FacultyTeacher {
  const rawSpaces = pick(raw, 'academicSpaces', 'espacios');
  const academicSpaces: AssignedAcademicSpace[] = Array.isArray(rawSpaces)
    ? rawSpaces.filter(isRecord).map((s) => {
        const postgraduateModuleHours = readOptNum(
          s,
          'postgraduateModuleHours',
          'horasModuloPosgrado',
        );
        return {
          id: readStr(s, 'id'),
          name: readStr(s, 'name', 'nombre'),
          level: readEnum(s, 'level', 'nivel', ACADEMIC_LEVELS, 'Pregrado'),
          monthlyHours: readNum(s, 'monthlyHours', 'horasMes'),
          ...(postgraduateModuleHours !== undefined ? { postgraduateModuleHours } : {}),
        };
      })
    : [];

  const rawAllocations = pick(raw, 'allocations', 'asignaciones');
  const allocations: Record<string, TeacherCodeAllocation> = {};
  if (isRecord(rawAllocations)) {
    for (const [code, item] of Object.entries(rawAllocations)) {
      if (!isRecord(item)) continue;
      const version1Hours = readOptNum(item, 'version1Hours', 'horasVersion1');
      const unitCount = readOptNum(item, 'unitCount', 'cantidadUnidades');
      const exceptionJustification = readOptStr(
        item,
        'exceptionJustification',
        'justificacionExcepcion',
      );
      const directorNote = readOptStr(item, 'directorNote', 'observacionDirectora');
      allocations[code] = {
        code: readStr(item, 'code', 'codigo', code),
        hours: readNum(item, 'hours', 'horas'),
        ...(version1Hours !== undefined ? { version1Hours } : {}),
        ...(unitCount !== undefined ? { unitCount } : {}),
        ...(exceptionJustification !== undefined ? { exceptionJustification } : {}),
        ...(directorNote !== undefined ? { directorNote } : {}),
        ...(pick(item, 'adjustedByDirector', 'ajustadoPorDirectora') !== undefined
          ? { adjustedByDirector: readBool(item, 'adjustedByDirector', 'ajustadoPorDirectora') }
          : {}),
      };
    }
  }

  const pseManualOverride = readOptNum(raw, 'pseManualOverride');
  const sharedHours = readOptNum(raw, 'sharedHours', 'horasCompartidas');
  const sharedUnitName = readOptStr(raw, 'sharedUnitName', 'unidadCompartida');
  const generalNote = readOptStr(raw, 'generalNote', 'observacionGeneral');
  const version1Total = readOptNum(raw, 'version1Total', 'totalVersion1');

  return {
    id: readStr(raw, 'id'),
    unitId: readStr(raw, 'unitId', 'facultadId'),
    documentId: readStr(raw, 'documentId', 'cedula'),
    fullName: readStr(raw, 'fullName', 'nombre'),
    dedication: readEnum(raw, 'dedication', 'dedicacion', TEACHER_DEDICATIONS, 'TC'),
    expectedWorkload: readNum(raw, 'expectedWorkload', 'cargaEsperada', 160),
    rank: readStr(raw, 'rank', 'escalafon'),
    education: readStr(raw, 'education', 'formacion'),
    isProvisional: readBool(raw, 'isProvisional', 'provisional'),
    seniorityYears: readNum(raw, 'seniorityYears', 'antiguedadAnios'),
    academicSpaces,
    ...(pseManualOverride !== undefined ? { pseManualOverride } : {}),
    allocations,
    ...(sharedHours !== undefined ? { sharedHours } : {}),
    ...(sharedUnitName !== undefined ? { sharedUnitName } : {}),
    ...(generalNote !== undefined ? { generalNote } : {}),
    ...(version1Total !== undefined ? { version1Total } : {}),
  };
}

export function normalizeApprovalRequest(raw: RawRecord): ApprovalRequestAnnex3 {
  const rawDetails = pick(raw, 'projectDetails', 'detallesProyectos');
  const viceRectorNote = readOptStr(raw, 'viceRectorNote', 'observacionVicerrector');
  const decidedBy = readOptStr(raw, 'decidedBy', 'decididoPor');
  const decidedAt = readOptStr(raw, 'decidedAt', 'fechaDecision');

  return {
    id: readStr(raw, 'id'),
    period: readStr(raw, 'period', 'periodo', '2026-2'),
    unitId: readStr(raw, 'unitId', 'facultadId'),
    unitName: readStr(raw, 'unitName', 'facultadNombre'),
    teacherId: readStr(raw, 'teacherId', 'docenteId'),
    teacherName: readStr(raw, 'teacherName', 'docenteNombre'),
    teacherDocumentId: readStr(raw, 'teacherDocumentId', 'docenteCedula'),
    code: readStr(raw, 'code', 'codigo'),
    codeName: readStr(raw, 'codeName', 'nombreCodigo'),
    requestedHours: readNum(raw, 'requestedHours', 'horasSolicitadas'),
    formatType: readEnum(raw, 'formatType', 'formatoTipo', ANNEX3_FORMATS, '10212'),
    programName: readStr(raw, 'programName', 'programa'),
    projectDetails: Array.isArray(rawDetails)
      ? rawDetails.filter(isRecord).map((d) => ({
          title: readStr(d, 'title', 'titulo'),
          projectType: readStr(d, 'projectType', 'tipo'),
          studentsOrCourse: readStr(d, 'studentsOrCourse', 'estudiantesOCurso'),
          committeeApprovalMinute: readStr(
            d,
            'committeeApprovalMinute',
            'actaAvalComite',
          ),
          hours: readNum(d, 'hours', 'horas'),
        }))
      : [],
    attachmentUrl: readStr(raw, 'attachmentUrl', 'soporteAdjunto'),
    status: readEnum(raw, 'status', 'estado', APPROVAL_STATUSES, 'Pendiente'),
    ...(viceRectorNote !== undefined ? { viceRectorNote } : {}),
    requestedAt: readStr(raw, 'requestedAt', 'fechaSolicitud'),
    ...(decidedBy !== undefined ? { decidedBy } : {}),
    ...(decidedAt !== undefined ? { decidedAt } : {}),
  };
}

export function normalizeResearchAllocation(raw: RawRecord): ResearchAllocationAnnex7 {
  const levelRaw = pick(raw, 'sicddiLevel', 'nivelSicddi');
  const sicddiLevel = isOneOf(levelRaw, SICDDI_LEVELS) ? levelRaw : null;
  const notes = readOptStr(raw, 'notes', 'observacion');

  return {
    id: readStr(raw, 'id'),
    period: readStr(raw, 'period', 'periodo', '2026-2'),
    unitId: readStr(raw, 'unitId', 'facultadId'),
    unitName: readStr(raw, 'unitName', 'facultadNombre'),
    documentId: readStr(raw, 'documentId', 'cedula'),
    teacherName: readStr(raw, 'teacherName', 'docenteNombre'),
    code: readStr(raw, 'code', 'codigo'),
    activityName: readStr(raw, 'activityName', 'nombreActividad'),
    projectOrGroup: readStr(raw, 'projectOrGroup', 'proyectoOGrupo'),
    role: readStr(raw, 'role', 'rol'),
    sicddiLevel,
    weeklyHours: readNum(raw, 'weeklyHours', 'horasSemana'),
    monthlyHours: readNum(raw, 'monthlyHours', 'horasMes'),
    isSicddiLocked: readBool(raw, 'isSicddiLocked', 'bloqueadoSicddi'),
    ...(notes !== undefined ? { notes } : {}),
  };
}

export function normalizeAuditLog(raw: RawRecord): AuditLogEntry {
  const teacherName = readOptStr(raw, 'teacherName', 'docente');
  const previousValue = readOptStr(raw, 'previousValue', 'valorAnterior');
  const newValue = readOptStr(raw, 'newValue', 'valorNuevo');
  const reason = readOptStr(raw, 'reason', 'motivo');

  return {
    id: readStr(raw, 'id'),
    timestamp: readStr(raw, 'timestamp', 'fecha'),
    user: readStr(raw, 'user', 'usuario'),
    role: readStr(raw, 'role', 'rol'),
    unitName: readStr(raw, 'unitName', 'facultad'),
    ...(teacherName !== undefined ? { teacherName } : {}),
    action: readStr(raw, 'action', 'accion'),
    ...(previousValue !== undefined ? { previousValue } : {}),
    ...(newValue !== undefined ? { newValue } : {}),
    ...(reason !== undefined ? { reason } : {}),
  };
}

export function normalizeRulesConfig(raw: RawRecord | undefined): BusinessRulesConfig {
  if (!raw) {
    return {
      includePostgraduateInPse125: false,
      enforceAnnex6CapOnGraduates: true,
      blockSubmissionWithBlockingAlerts: true,
      minFullTimeTeachingHours: 64,
      maxRecommendedAcademicSpaces: 4,
    };
  }
  return {
    includePostgraduateInPse125: readBool(
      raw,
      'includePostgraduateInPse125',
      'incluirPosgradoEnPse125',
      false,
    ),
    enforceAnnex6CapOnGraduates: readBool(
      raw,
      'enforceAnnex6CapOnGraduates',
      'respetarTopeAnexo6EnGraduados',
      true,
    ),
    blockSubmissionWithBlockingAlerts: readBool(
      raw,
      'blockSubmissionWithBlockingAlerts',
      'bloquearEnvioConAlertasBloqueantes',
      true,
    ),
    minFullTimeTeachingHours: readNum(
      raw,
      'minFullTimeTeachingHours',
      'minimoDocenciaTcHoras',
      64,
    ),
    maxRecommendedAcademicSpaces: readNum(
      raw,
      'maxRecommendedAcademicSpaces',
      'maximoEspaciosRecomendados',
      4,
    ),
  };
}

export function normalizeSchedulePhase(raw: RawRecord): SchedulePhase {
  return {
    id: readStr(raw, 'id'),
    label: readStr(raw, 'label', 'etiqueta'),
    title: readStr(raw, 'title', 'titulo'),
    dateRange: readStr(raw, 'dateRange', 'rangoFechas'),
    status: readEnum(raw, 'status', 'estado', PHASE_STATUSES, 'Programada'),
  };
}

export function normalizePersistedState(raw: RawRecord): LegacyImportedState {
  const rawCodes = pick(raw, 'sacCodes', 'codigosSac');
  const rawUnits = pick(raw, 'units', 'unidades');
  const rawQuotas = pick(raw, 'programQuotas', 'topesProgramas');
  const rawTeachers = pick(raw, 'teachers', 'docentes');
  const rawApprovals = pick(raw, 'approvalRequests', 'solicitudesAval');
  const rawResearch = pick(raw, 'researchAllocations', 'asignacionesInvestigacion');
  const rawAudit = pick(raw, 'auditLogs', 'bitacora');
  const rawPhases = pick(raw, 'schedulePhases', 'cronogramaFases');
  const rawAvailablePeriods = pick(raw, 'availablePeriods', 'periodosDisponibles');
  const rawRules = pick(raw, 'rulesConfig', 'reglasConfig');

  return {
    activePeriod: readStr(raw, 'activePeriod', 'periodoActivo', '2026-2'),
    availablePeriods: Array.isArray(rawAvailablePeriods)
      ? rawAvailablePeriods.map((p) => String(p))
      : ['2026-2', '2026-1', '2025-2'],
    ...(Array.isArray(rawPhases)
      ? { schedulePhases: rawPhases.filter(isRecord).map(normalizeSchedulePhase) }
      : {}),
    activeRole: mapRole(readOptStr(raw, 'activeRole', 'rolActivo')),
    activeUnitId: readStr(raw, 'activeUnitId', 'facultadActivaId', 'ing-industrial'),
    rulesConfig: normalizeRulesConfig(isRecord(rawRules) ? rawRules : undefined),
    sacCodes: Array.isArray(rawCodes) ? rawCodes.filter(isRecord).map(normalizeSacCode) : [],
    units: Array.isArray(rawUnits) ? rawUnits.filter(isRecord).map(normalizeAcademicUnit) : [],
    programQuotas: Array.isArray(rawQuotas)
      ? rawQuotas.filter(isRecord).map(normalizeProgramQuota)
      : [],
    teachers: Array.isArray(rawTeachers) ? rawTeachers.filter(isRecord).map(normalizeTeacher) : [],
    approvalRequests: Array.isArray(rawApprovals)
      ? rawApprovals.filter(isRecord).map(normalizeApprovalRequest)
      : [],
    researchAllocations: Array.isArray(rawResearch)
      ? rawResearch.filter(isRecord).map(normalizeResearchAllocation)
      : [],
    auditLogs: Array.isArray(rawAudit) ? rawAudit.filter(isRecord).map(normalizeAuditLog) : [],
    updatedAt: readStr(raw, 'updatedAt', undefined, new Date().toISOString()),
  };
}
