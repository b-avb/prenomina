/**
 * REST API contract shared by `usta-api` (producer) and `usta-web` (consumer).
 *
 * Conventions:
 *  - Every successful response is wrapped in `ApiSuccess<T>`; every failure in `ApiFailure`.
 *  - Creation DTOs never carry an `id`: identifiers are generated exclusively by the server.
 *  - Resource mutations address the target entity via RESTful path parameters (`:id`, `:code`, `:spaceId`).
 *  - Period-scoped collection reads and creations accept an optional `?period=` query param
 *    (defaults to the current period).
 *  - Every protected endpoint requires a signed `Authorization: Bearer <jwt>` token.
 */
import type { CreateAcademicUnitPayload, UpdateUnitDeanPayload } from '../academic-organization.domain.js';
import type { CreateTeacherPayload } from '../workload-balancer.domain.js';
import type {
  AcademicPeriod,
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  ApprovalStatus,
  AuditLogEntry,
  AuthMode,
  AuthProvider,
  AuthUser,
  BusinessRulesConfig,
  FacultyTeacher,
  PayrollRole,
  PayrollSnapshot,
  PayrollStatus,
  ProgramQuotaAnnex5,
  ResearchAllocationAnnex7,
  SacCode,
  SchedulePhase,
} from '../types/payroll.types.js';

// ─── Envelope ────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  code: ApiErrorCode;
  error: string;
  details?: unknown;
}

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'PASSWORD_CHANGE_REQUIRED'
  | 'TOO_MANY_REQUESTS'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'FORBIDDEN'
  | 'ROUTE_NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR';

export const ACTOR_HEADERS = {
  period: 'X-Academic-Period',
} as const;

export interface ActorContext {
  name: string;
  role: PayrollRole;
  userId?: string;
  username?: string;
  unitId?: string | null;
  managedUnitIds?: string[];
}

// ─── Authentication & Users ──────────────────────────────────────────────────

export const INSTITUTIONAL_EMAIL_DOMAIN = 'santototunja.edu.co';

/** GET /api/auth/config */
export interface AuthConfigResponse {
  authMode: AuthMode;
  allowLocalLogin: boolean;
  microsoftEntra: {
    enabled: boolean;
    tenantId: string | null;
    clientId: string | null;
    apiScope: string | null;
    authority: string | null;
    institutionalDomain: string;
    cacheLocation: 'sessionStorage' | 'localStorage';
  };
}

/** POST /api/auth/login */
export interface LoginDto {
  username: string;
  password: string;
}

/** POST /api/auth/microsoft */
export interface MicrosoftLoginDto {
  idToken?: string;
  accessToken?: string;
}

export interface AuthSessionResponse {
  token: string;
  user: AuthUser;
}

/** POST /api/auth/change-password */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** GET /api/users */
export type UserListResponse = AuthUser[];

/** POST /api/users */
export interface CreateUserAccountDto {
  username: string;
  email?: string | null;
  fullName: string;
  role: PayrollRole;
  unitId?: string | null;
  temporaryPassword?: string;
  authProvider?: AuthProvider;
}

/** POST /api/users/:id/reset-password */
export interface ResetUserPasswordDto {
  id: string;
  temporaryPassword?: string;
}

export interface ResetUserPasswordResponse {
  user: AuthUser;
  temporaryPassword: string;
}

// ─── System ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  uptimeSeconds: number;
  timestamp: string;
}

/** GET /api/state?period= */
export type SnapshotResponse = PayrollSnapshot;

// ─── Periods ─────────────────────────────────────────────────────────────────

/** POST /api/periods — clones the source period server-side. */
export interface CreatePeriodDto {
  code: string;
  sourcePeriod: string;
  resetStatuses: boolean;
}

export type PeriodResponse = AcademicPeriod;

// ─── Rules ───────────────────────────────────────────────────────────────────

/** PUT /api/rules-config?period= → BusinessRulesConfig */
export type UpdateRulesConfigDto = Partial<BusinessRulesConfig>;

// ─── Schedule phases ─────────────────────────────────────────────────────────

/** PUT /api/schedule-phases/:id → SchedulePhase (phase ids are unique across periods). */
export type UpdateSchedulePhaseDto = Partial<Omit<SchedulePhase, 'id'>> & { id: string };

// ─── Academic units ──────────────────────────────────────────────────────────

/** POST /api/units */
export type CreateAcademicUnitDto = CreateAcademicUnitPayload;

export interface UnitWithDirectorResponse {
  unit: AcademicUnitSummary;
  directorTeacher: FacultyTeacher;
  deanUser?: AuthUser;
  temporaryPassword?: string;
}

/** PUT /api/units/:id — profile and quota caps edition. */
export interface UpdateAcademicUnitDto {
  id: string;
  name?: string;
  division?: string;
  unitType?: AcademicUnitSummary['unitType'];
  hasPostgraduates?: boolean;
  qualityCap30411?: number;
  curriculumCap40106?: number;
  seaCap40109?: number;
  saberProCap40127?: number;
  graduatesCap20502?: number;
}

/** PUT /api/units/:id/dean */
export type UpdateUnitDeanDto = UpdateUnitDeanPayload;

/** PATCH /api/units/:id/status?period= → UnitVersionSnapshotResponse ('Enviada' snapshots v1 and bumps the version). */
export interface ChangeUnitStatusDto {
  unitId: string;
  status: PayrollStatus;
  observation?: string;
}

/** POST /api/units/:id/version-snapshot?period= */
export interface SnapshotUnitVersionDto {
  unitId: string;
}

export interface UnitVersionSnapshotResponse {
  unit: AcademicUnitSummary;
  teachers: FacultyTeacher[];
}

// ─── Academic programs (Annex 5) ─────────────────────────────────────────────

/** POST /api/programs */
export type CreateAcademicProgramDto = Omit<ProgramQuotaAnnex5, 'id' | 'unitName'>;

/** PUT /api/programs/:id */
export type UpdateAcademicProgramDto = Partial<Omit<ProgramQuotaAnnex5, 'id' | 'unitId' | 'unitName'>> & {
  id: string;
};

/** Program writes return the unit too, because its quota caps are recalculated server-side. */
export interface ProgramMutationResponse {
  program: ProgramQuotaAnnex5 | null;
  unit: AcademicUnitSummary;
}

// ─── SAC catalog (Annex 4) ───────────────────────────────────────────────────

/** POST /api/sac-codes */
export type CreateSacCodeDto = SacCode;

/** PUT /api/sac-codes/:code */
export type UpdateSacCodeDto = Partial<Omit<SacCode, 'code'>> & {
  code: string;
  newCode?: string;
};

export interface ImportedSacCodeRowDto {
  code: string;
  name?: string;
  substantiveFunction?: SacCode['substantiveFunction'];
  definition?: string;
  guideline?: string;
  baseHours?: number | null;
  capHours?: number | null;
  postgraduateCapHours?: number | null;
  requiresViceRectorApproval?: boolean;
  appliesTo?: string;
  severity?: SacCode['severity'];
}

/** POST /api/sac-codes/import → ImportSacCodesResponse */
export interface ImportSacCodesDto {
  rows: ImportedSacCodeRowDto[];
}

export interface ImportSacCodesResponse {
  codes: SacCode[];
  createdCount: number;
  updatedCount: number;
}

// ─── Teachers (Annex 2) ──────────────────────────────────────────────────────

/** POST /api/teachers?period= */
export type CreateTeacherDto = CreateTeacherPayload & { unitId: string };

/** PUT /api/teachers/:id — profile fields only; allocations and spaces have dedicated endpoints. */
export interface UpdateTeacherDto {
  id: string;
  documentId?: string;
  fullName?: string;
  dedication?: FacultyTeacher['dedication'];
  expectedWorkload?: number;
  rank?: string;
  education?: string;
  isProvisional?: boolean;
  sharedHours?: number;
  sharedUnitName?: string;
  generalNote?: string;
  pseManualOverride?: number | null;
}

/** POST /api/teachers/:teacherId/spaces — `hours` are module hours for postgraduate spaces. */
export interface AddAcademicSpaceDto {
  teacherId: string;
  name: string;
  level: 'Pregrado' | 'Posgrado';
  hours: number;
}

/** PUT /api/teachers/:teacherId/spaces/:spaceId → FacultyTeacher. `hours` are module hours for postgraduate spaces. */
export interface UpdateAcademicSpaceDto {
  teacherId: string;
  spaceId: string;
  name?: string;
  level?: 'Pregrado' | 'Posgrado';
  hours?: number;
}

/** DELETE /api/teachers/:teacherId/spaces/:spaceId → FacultyTeacher */

/** PUT /api/teachers/:teacherId/allocations/:code */
export interface UpdateCodeAllocationDto {
  teacherId: string;
  code: string;
  hours: number;
  programId?: string | null;
  programName?: string | null;
  exceptionJustification?: string;
  directorNote?: string;
}

/** Teacher import row: identical to a teacher but without any identifier. */
export type ImportedTeacherDto = Omit<FacultyTeacher, 'id' | 'unitId' | 'academicSpaces'> & {
  academicSpaces: Array<Omit<FacultyTeacher['academicSpaces'][number], 'id'>>;
};

/** POST /api/units/:id/teachers/import?period= — replaces the unit roster for the period. */
export interface ImportTeachersDto {
  unitId: string;
  fileName: string;
  teachers: ImportedTeacherDto[];
}

// ─── Approvals (Annex 3) ─────────────────────────────────────────────────────

/** POST /api/approvals?period= — upserts the pending request for (teacherId, code). */
export type CreateApprovalRequestDto = Omit<
  ApprovalRequestAnnex3,
  'id' | 'period' | 'status' | 'requestedAt' | 'decidedBy' | 'decidedAt' | 'viceRectorNote'
>;

/** POST /api/approvals/attachments */
export interface UploadApprovalAttachmentDto {
  fileName: string;
  mimeType: string;
  contentBase64: string;
}

export interface ApprovalAttachmentResponse {
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

/** PATCH /api/approvals/:id/decision — `decidedBy` is taken from the actor context. */
export interface DecideApprovalDto {
  id: string;
  status: ApprovalStatus;
  viceRectorNote?: string;
}

// ─── Research (Annex 7) ──────────────────────────────────────────────────────

/** POST /api/research?period= */
export type CreateResearchAllocationDto = Omit<ResearchAllocationAnnex7, 'id' | 'period'>;

/** PUT /api/research/:id */
export type UpdateResearchAllocationDto = Partial<Omit<ResearchAllocationAnnex7, 'id' | 'period'>> & {
  id: string;
};

/** Research writes return the affected teacher, whose allocations are synchronized server-side. */
export interface ResearchMutationResponse {
  allocation: ResearchAllocationAnnex7 | null;
  teacher: FacultyTeacher | null;
}

// ─── Audit ───────────────────────────────────────────────────────────────────

/** GET /api/audit-logs?unitId=&limit= — read only; entries are written by the server. */
export type AuditLogListResponse = AuditLogEntry[];

export interface DeletedResponse {
  deletedId: string;
}
