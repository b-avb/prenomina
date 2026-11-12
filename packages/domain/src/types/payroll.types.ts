export type SubstantiveFunction =
  | 'Enseñanza-Aprendizaje'
  | 'Proyección Social'
  | 'Investigación'
  | 'Gestión Académica';

export type RuleSeverity = 'blocking' | 'justifiable_alert' | 'informative';

export type PayrollRole = 'director' | 'dean' | 'vice_rector' | 'research';

export type TeacherDedication = 'TC' | 'MT' | 'CATEDRA' | 'DIRECTIVO';

export type PayrollStatus =
  | 'Borrador'
  | 'Enviada'
  | 'En Revisión'
  | 'Devuelta con Observaciones'
  | 'Avalada';

export type ApprovalStatus = 'Pendiente' | 'Avalado' | 'Con Observaciones' | 'Rechazado';

export interface FacultySpecificRule {
  unitId: string;
  unitName: string;
  minTeacherHours: number | null;
  maxTeacherHours: number | null;
  facultyBagCap?: number | null;
}

export interface SacCode {
  code: string;
  name: string;
  substantiveFunction: SubstantiveFunction;
  definition: string;
  guideline: string;
  baseHours: number | null;
  capHours: number | null;
  postgraduateCapHours?: number | null;
  psePercentage?: number | null;
  hoursPerUnitFactor?: number | null;
  unitLabel?: string | null;
  requiresViceRectorApproval: boolean;
  annex3Format?: '10212' | '20223_20120' | '20222' | '40126' | '40222' | '43401' | null;
  appliesTo: string;
  severity: RuleSeverity;
  mandatoryInFaculty?: boolean | null;
  lockedByResearch?: boolean | null;
  facultyRules?: FacultySpecificRule[];
}

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
  graduatesCap20502: number;
  totalTeachers: number;
  pendingAlerts: number;
  pendingApprovals: number;
}

export interface AssignedAcademicSpace {
  id: string;
  name: string;
  level: 'Pregrado' | 'Posgrado';
  monthlyHours: number;
  postgraduateModuleHours?: number;
}

export interface TeacherCodeAllocation {
  code: string;
  hours: number;
  programId?: string;
  programName?: string;
  version1Hours?: number;
  unitCount?: number;
  exceptionJustification?: string;
  directorNote?: string;
  adjustedByDirector?: boolean;
}

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
  pseManualOverride?: number | null;
  allocations: Record<string, TeacherCodeAllocation>;
  sharedHours?: number;
  sharedUnitName?: string;
  generalNote?: string;
  version1Total?: number;
}

export interface ApprovalProjectDetail {
  title: string;
  projectType: string;
  studentsOrCourse: string;
  committeeApprovalMinute: string;
  hours: number;
}

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
  sicddiLevel?: 'Nivel I (20h)' | 'Nivel II (80h)' | 'Nivel III (136h)' | null;
  weeklyHours: number;
  monthlyHours: number;
  isSicddiLocked: boolean;
  notes?: string;
}

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
 * It is a read-only projection: writes always go through granular resource endpoints.
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
  managedUnitIds?: string[];
  mustChangePassword: boolean;
  isActive: boolean;
  passwordChangedAt: string | null;
  lastLoginAt?: string | null;
  updatedAt: string;
}


