/** Substantive university functions defined in the SAC activity catalog (Annex 4). */
export type SubstantiveFunction =
  | 'Enseñanza-Aprendizaje'
  | 'Proyección Social'
  | 'Investigación'
  | 'Gestión Académica';

/** Enforcement behavior when a teacher or unit exceeds an Annex 4/5/6 threshold. */
export type RuleSeverity = 'blocking' | 'justifiable_alert' | 'informative';

/** Institutional governance roles authorized to access the platform. */
export type PayrollRole = 'director' | 'dean' | 'vice_rector' | 'research';

/** Contractual dedication categories: Full-Time (160 h), Half-Time (80 h), Adjunct (48 h), Executive (210 h). */
export type TeacherDedication = 'TC' | 'MT' | 'CATEDRA' | 'DIRECTIVO';

/** Lifecycle states for an academic unit's semester payroll projection. */
export type PayrollStatus =
  | 'Borrador'
  | 'Enviada'
  | 'En Revisión'
  | 'Devuelta con Observaciones'
  | 'Avalada';

/** Review states for Annex 3 Vice-Rectorate approval requests. */
export type ApprovalStatus = 'Pendiente' | 'Avalado' | 'Con Observaciones' | 'Rechazado';

/** Per-unit overrides on an Annex 4 SAC activity code. */
export interface FacultySpecificRule {
  unitId: string;
  unitName: string;
  minTeacherHours: number | null;
  maxTeacherHours: number | null;
  /** Optional unit-wide monthly hour cap across all teachers in the unit. */
  facultyBagCap?: number | null;
}

/** Institutional SAC activity definition (Annex 4). Hours are expressed as monthly values. */
export interface SacCode {
  code: string;
  name: string;
  substantiveFunction: SubstantiveFunction;
  definition: string;
  guideline: string;
  baseHours: number | null;
  capHours: number | null;
  /** Elevated per-teacher monthly cap applicable when the parent unit offers active postgraduate programs. */
  postgraduateCapHours?: number | null;
  psePercentage?: number | null;
  hoursPerUnitFactor?: number | null;
  unitLabel?: string | null;
  requiresViceRectorApproval: boolean;
  annex3Format?: '10212' | '20223_20120' | '20222' | '40126' | '40222' | '43401' | null;
  appliesTo: string;
  severity: RuleSeverity;
  mandatoryInFaculty?: boolean | null;
  /** When true, allocations are managed exclusively through the Annex 7 research module. */
  lockedByResearch?: boolean | null;
  facultyRules?: FacultySpecificRule[];
}

/** Per-program monthly hour quotas defined in Annex 5. */
export interface ProgramQuotaAnnex5 {
  id: string;
  unitId: string;
  unitName: string;
  programName: string;
  level: 'Pregrado' | 'Posgrado';
  modality: 'Presencial' | 'Virtual' | 'Híbrida';
  accreditationStatus: string;
  quality30411: number;
  qualityNotes?: string;
  curriculum40106: number;
  curriculumNotes?: string;
  sea40109: number;
  saberPro40127: number;
  isActive: boolean;
}

/** Academic unit (Faculty or Academic Directorate) and its aggregated monthly bag caps for a period. */
export interface AcademicUnitSummary {
  id: string;
  name: string;
  division: string;
  unitType: 'Facultad' | 'Dirección Académica';
  hasPostgraduates: boolean;
  deanName: string;
  payrollStatus: PayrollStatus;
  currentVersion: number;
  updatedAt: string;
  qualityCap30411: number;
  curriculumCap40106: number;
  seaCap40109: number;
  saberProCap40127: number;
  /** Monthly cap for Alumni Management (20502), sourced from Annex 6 rather than Annex 5 programs. */
  graduatesCap20502: number;
  totalTeachers: number;
  pendingAlerts: number;
  pendingApprovals: number;
}

/** Direct teaching course assigned to a teacher under 40104 (Undergraduate) or 40006 (Postgraduate). */
export interface AssignedAcademicSpace {
  id: string;
  name: string;
  level: 'Pregrado' | 'Posgrado';
  /** Normalized monthly teaching hours; for postgraduate modules, equals `postgraduateModuleHours / 4`. */
  monthlyHours: number;
  postgraduateModuleHours?: number;
}

/** Monthly hours allocated to a teacher on a specific SAC activity code. */
export interface TeacherCodeAllocation {
  code: string;
  hours: number;
  /** Binds Annex 5 bag codes (30411, 40106, 40109, 40127) to a specific academic program quota. */
  programId?: string;
  programName?: string;
  /** Baseline hours captured when the unit payroll first transitions to `Enviada` (v1). */
  version1Hours?: number;
  unitCount?: number;
  exceptionJustification?: string;
  directorNote?: string;
  adjustedByDirector?: boolean;
}

/** Faculty roster entry and its full monthly workload breakdown for an academic period (Annex 2). */
export interface FacultyTeacher {
  id: string;
  unitId: string;
  documentId: string;
  fullName: string;
  dedication: TeacherDedication;
  expectedWorkload: number;
  rank: string;
  education: string;
  isProvisional: boolean;
  seniorityYears: number;
  academicSpaces: AssignedAcademicSpace[];
  /** Explicit monthly PSE (40108) override; when null/undefined, PSE is derived from direct teaching hours. */
  pseManualOverride?: number | null;
  allocations: Record<string, TeacherCodeAllocation>;
  /** Monthly hours committed in a secondary academic unit for shared faculty appointments. */
  sharedHours?: number;
  sharedUnitName?: string;
  generalNote?: string;
  /** Total monthly hours captured at the initial v1 submission snapshot. */
  version1Total?: number;
}

export interface ApprovalProjectDetail {
  title: string;
  projectType: string;
  studentsOrCourse: string;
  committeeApprovalMinute: string;
  hours: number;
}

/** Vice-Rectorate approval filing required by restricted Annex 4 SAC codes (Annex 3). */
export interface ApprovalRequestAnnex3 {
  id: string;
  period: string;
  unitId: string;
  unitName: string;
  teacherId: string;
  teacherName: string;
  teacherDocumentId: string;
  code: string;
  codeName: string;
  requestedHours: number;
  formatType: '10212' | '20223_20120' | '20222' | '40126' | '40222' | '43401';
  programName: string;
  projectDetails: ApprovalProjectDetail[];
  attachmentUrl: string;
  status: ApprovalStatus;
  viceRectorNote?: string;
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
}

/** Confidential research workload assignment managed by the Research Directorate (Annex 7). */
export interface ResearchAllocationAnnex7 {
  id: string;
  period: string;
  unitId: string;
  unitName: string;
  documentId: string;
  teacherName: string;
  code: string;
  activityName: string;
  projectOrGroup: string;
  role: string;
  /** Fixed SICDDI researcher tiers defined by Acuerdo 3 (19/03/2025) for SAC code 10226. */
  sicddiLevel?: 'Nivel I (20h)' | 'Nivel II (80h)' | 'Nivel III (136h)' | null;
  weeklyHours: number;
  monthlyHours: number;
  isSicddiLocked: boolean;
  notes?: string;
}

/** Immutable audit trail record persisted on state-mutating operations. */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  unitName: string;
  teacherName?: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

/** Configurable normative toggles applied by the workload calculator and validation engine per period. */
export interface BusinessRulesConfig {
  includePostgraduateInPse125: boolean;
  enforceAnnex6CapOnGraduates: boolean;
  blockSubmissionWithBlockingAlerts: boolean;
  minFullTimeTeachingHours: number;
  maxRecommendedAcademicSpaces: number;
}

export interface SchedulePhase {
  id: string;
  label: string;
  title: string;
  dateRange: string;
  status: 'Completada' | 'Activa' | 'Programada';
}

/**
 * Aggregated read model returned by `GET /api/state` for a single academic period.
 * Read-only projection; state mutations always go through resource-specific endpoints.
 */
export interface PayrollSnapshot {
  activePeriod: string;
  currentPeriod: string;
  availablePeriods: string[];
  schedulePhases: SchedulePhase[];
  rulesConfig: BusinessRulesConfig;
  sacCodes: SacCode[];
  units: AcademicUnitSummary[];
  programQuotas: ProgramQuotaAnnex5[];
  teachers: FacultyTeacher[];
  approvalRequests: ApprovalRequestAnnex3[];
  researchAllocations: ResearchAllocationAnnex7[];
  auditLogs: AuditLogEntry[];
  generatedAt: string;
}

export interface AcademicPeriod {
  code: string;
  name: string;
  status: 'ABIERTO' | 'EN_CONSOLIDACION' | 'CERRADO_SAC';
  isCurrent: boolean;
  openedAt: string;
  closedAt: string | null;
}

export type AuthMode = 'local' | 'hybrid' | 'microsoft';

export type AuthProvider = 'local' | 'microsoft_entra' | 'hybrid';

export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
  entraOid?: string | null;
  authProvider?: AuthProvider;
  fullName: string;
  role: PayrollRole;
  unitId: string | null;
  unitName?: string | null;
  /** All academic unit IDs under a Dean's authority (supports Deans overseeing multiple units). */
  managedUnitIds?: string[];
  mustChangePassword: boolean;
  isActive: boolean;
  passwordChangedAt: string | null;
  lastLoginAt?: string | null;
  updatedAt: string;
}


