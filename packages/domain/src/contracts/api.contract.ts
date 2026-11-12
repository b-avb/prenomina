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

/** Authenticated principal resolved from the verified Bearer JWT on each request. */
export interface ActorContext {
  name: string;
  role: PayrollRole;
  userId?: string;
  username?: string;
  unitId?: string | null;
  managedUnitIds?: string[];
}

export const INSTITUTIONAL_EMAIL_DOMAIN = 'santototunja.edu.co';

/** `GET /api/auth/config` */
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

/** `POST /api/auth/login` */
export interface LoginDto {
  username: string;
  password: string;
}

/** `POST /api/auth/microsoft` */
export interface MicrosoftLoginDto {
  idToken?: string;
  accessToken?: string;
}

export interface AuthSessionResponse {
  token: string;
  user: AuthUser;
}

/** `POST /api/auth/change-password` */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** `GET /api/users` */
export type UserListResponse = AuthUser[];

/** `POST /api/users` */
export interface CreateUserAccountDto {
  username: string;
  email?: string | null;
  fullName: string;
  role: PayrollRole;
  unitId?: string | null;
  temporaryPassword?: string;
  authProvider?: AuthProvider;
}

/** `POST /api/users/:id/reset-password` */
export interface ResetUserPasswordDto {
  id: string;
  temporaryPassword?: string;
}

export interface ResetUserPasswordResponse {
  user: AuthUser;
  temporaryPassword: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  uptimeSeconds: number;
  timestamp: string;
}

/** `GET /api/state?period=` */
export type SnapshotResponse = PayrollSnapshot;

/** `POST /api/periods` — clones teachers, spaces, allocations, rules, and schedule phases from `sourcePeriod`. */
export interface CreatePeriodDto {
  code: string;
  sourcePeriod: string;
  resetStatuses: boolean;
}

export type PeriodResponse = AcademicPeriod;

/** `PUT /api/rules-config?period=` */
export type UpdateRulesConfigDto = Partial<BusinessRulesConfig>;

/** `PUT /api/schedule-phases/:id` */
export type UpdateSchedulePhaseDto = Partial<Omit<SchedulePhase, 'id'>> & { id: string };

/** `POST /api/units` */
export type CreateAcademicUnitDto = CreateAcademicUnitPayload;

export interface UnitWithDirectorResponse {
  unit: AcademicUnitSummary;
  directorTeacher: FacultyTeacher;
  deanUser?: AuthUser;
  /** Populated only when a new Dean account is provisioned or its password is explicitly reset. */
  temporaryPassword?: string;
}

/** `PUT /api/units/:id` */
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

/** `PUT /api/units/:id/dean` */
export type UpdateUnitDeanDto = UpdateUnitDeanPayload;

/** `PATCH /api/units/:id/status?period=` — transitioning to `Enviada` captures the v1 baseline snapshot and increments `currentVersion` on subsequent re-submissions. */
export interface ChangeUnitStatusDto {
  unitId: string;
  status: PayrollStatus;
  observation?: string;
}

/** `POST /api/units/:id/version-snapshot?period=` */
export interface SnapshotUnitVersionDto {
  unitId: string;
}

export interface UnitVersionSnapshotResponse {
  unit: AcademicUnitSummary;
  teachers: FacultyTeacher[];
}

/** `POST /api/programs` */
export type CreateAcademicProgramDto = Omit<ProgramQuotaAnnex5, 'id' | 'unitName'>;

/** `PUT /api/programs/:id` */
export type UpdateAcademicProgramDto = Partial<Omit<ProgramQuotaAnnex5, 'id' | 'unitId' | 'unitName'>> & {
  id: string;
};

/** Returns both the mutated program and the parent unit after recalculating its aggregated Annex 5 caps. */
export interface ProgramMutationResponse {
  program: ProgramQuotaAnnex5 | null;
  unit: AcademicUnitSummary;
}

/** `POST /api/sac-codes` */
export type CreateSacCodeDto = SacCode;

/** `PUT /api/sac-codes/:code` — setting `newCode` renames the code across allocations, approvals, and research records. */
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

/** `POST /api/sac-codes/import` */
export interface ImportSacCodesDto {
  rows: ImportedSacCodeRowDto[];
}

export interface ImportSacCodesResponse {
  codes: SacCode[];
  createdCount: number;
  updatedCount: number;
}

/** `POST /api/teachers?period=` */
export type CreateTeacherDto = CreateTeacherPayload & { unitId: string };

/** `PUT /api/teachers/:id` — updates roster profile attributes; spaces and SAC allocations use dedicated sub-resources. */
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

/** `POST /api/teachers/:teacherId/spaces` — `hours` represents monthly hours for `Pregrado` and total module hours for `Posgrado`. */
export interface AddAcademicSpaceDto {
  teacherId: string;
  name: string;
  level: 'Pregrado' | 'Posgrado';
  hours: number;
}

/** `PUT /api/teachers/:teacherId/spaces/:spaceId` — `hours` represents monthly hours for `Pregrado` and total module hours for `Posgrado`. */
export interface UpdateAcademicSpaceDto {
  teacherId: string;
  spaceId: string;
  name?: string;
  level?: 'Pregrado' | 'Posgrado';
  hours?: number;
}

/** `PUT /api/teachers/:teacherId/allocations/:code` */
export interface UpdateCodeAllocationDto {
  teacherId: string;
  code: string;
  hours: number;
  programId?: string | null;
  programName?: string | null;
  exceptionJustification?: string;
  directorNote?: string;
}

/** Roster import entry; server assigns teacher and academic space UUIDs during persistence. */
export type ImportedTeacherDto = Omit<FacultyTeacher, 'id' | 'unitId' | 'academicSpaces'> & {
  academicSpaces: Array<Omit<FacultyTeacher['academicSpaces'][number], 'id'>>;
};

/** `POST /api/units/:id/teachers/import?period=` — atomically replaces the unit's period roster. */
export interface ImportTeachersDto {
  unitId: string;
  fileName: string;
  teachers: ImportedTeacherDto[];
}

/** `POST /api/approvals?period=` — upserts the Annex 3 request for `(teacherId, code)`. */
export type CreateApprovalRequestDto = Omit<
  ApprovalRequestAnnex3,
  'id' | 'period' | 'status' | 'requestedAt' | 'decidedBy' | 'decidedAt' | 'viceRectorNote'
>;

/** `POST /api/approvals/attachments` — accepts a base64-encoded PDF verified by `%PDF-` magic bytes on the server. */
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

/** `PATCH /api/approvals/:id/decision` — `decidedBy` is stamped from the authenticated Vice-Rector principal. */
export interface DecideApprovalDto {
  id: string;
  status: ApprovalStatus;
  viceRectorNote?: string;
}

/** `POST /api/research?period=` */
export type CreateResearchAllocationDto = Omit<ResearchAllocationAnnex7, 'id' | 'period'>;

/** `PUT /api/research/:id` */
export type UpdateResearchAllocationDto = Partial<Omit<ResearchAllocationAnnex7, 'id' | 'period'>> & {
  id: string;
};

/** Returns the mutated Annex 7 row and the affected teacher after synchronizing their SAC allocations. */
export interface ResearchMutationResponse {
  allocation: ResearchAllocationAnnex7 | null;
  teacher: FacultyTeacher | null;
}

/** `GET /api/audit-logs?unitId=&limit=` */
export type AuditLogListResponse = AuditLogEntry[];

export interface DeletedResponse {
  deletedId: string;
}
