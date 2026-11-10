import type { ColumnType, Generated, Kysely } from 'kysely';
import type {
  AcademicPeriod,
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  ApprovalStatus,
  AssignedAcademicSpace,
  AuthProvider,
  PayrollRole,
  PayrollStatus,
  ProgramQuotaAnnex5,
  ResearchAllocationAnnex7,
  RuleSeverity,
  SacCode,
  SchedulePhase,
  SubstantiveFunction,
  TeacherDedication,
} from '@usta/domain';

/**
 * Kysely table typings for the MariaDB schema created by the migrations.
 *
 * Conventions:
 *  - `TINYINT(1)` flags are exposed as `0 | 1` numbers and converted explicitly in the mappers.
 *  - `DECIMAL` columns are returned as numbers (`decimalNumbers: true` in the pool config).
 *  - `DATETIME` columns are returned as UTC `Date` instances (`timezone: 'Z'`).
 *  - `insertion_order` is an AUTO_INCREMENT unique column that preserves the curated row order.
 */

export type Flag = 0 | 1;
type AutoIncrement = Generated<number>;
type DefaultTimestamp = ColumnType<Date, Date | undefined, Date>;

export interface AcademicPeriodsTable {
  code: string;
  name: string;
  status: AcademicPeriod['status'];
  is_current: Flag;
  opened_at: Date;
  closed_at: Date | null;
  created_at: DefaultTimestamp;
}

export interface BusinessRulesTable {
  period_code: string;
  include_postgraduate_in_pse125: Flag;
  enforce_annex6_cap_on_graduates: Flag;
  block_submission_with_blocking_alerts: Flag;
  min_full_time_teaching_hours: number;
  max_recommended_academic_spaces: number;
  updated_by: string | null;
  updated_at: DefaultTimestamp;
}

export interface SchedulePhasesTable {
  id: string;
  period_code: string;
  sort_order: number;
  label: string;
  title: string;
  date_range: string;
  status: SchedulePhase['status'];
}

export interface AcademicUnitsTable {
  insertion_order: AutoIncrement;
  id: string;
  name: string;
  division: string;
  unit_type: AcademicUnitSummary['unitType'];
  has_postgraduates: Flag;
  dean_name: string;
  quality_cap_30411: number;
  curriculum_cap_40106: number;
  sea_cap_40109: number;
  saber_pro_cap_40127: number;
  graduates_cap_20502: number;
  created_at: DefaultTimestamp;
  updated_at: DefaultTimestamp;
}

export interface UnitPayrollCyclesTable {
  unit_id: string;
  period_code: string;
  payroll_status: PayrollStatus;
  current_version: number;
  updated_at: Date;
}

export interface AcademicProgramsTable {
  insertion_order: AutoIncrement;
  id: string;
  unit_id: string;
  program_name: string;
  level: ProgramQuotaAnnex5['level'];
  modality: ProgramQuotaAnnex5['modality'];
  accreditation_status: string;
  quality_30411: number;
  quality_notes: string | null;
  curriculum_40106: number;
  curriculum_notes: string | null;
  sea_40109: number;
  saber_pro_40127: number;
  is_active: Flag;
  created_at: DefaultTimestamp;
  updated_at: DefaultTimestamp;
}

export type Annex3Format = NonNullable<SacCode['annex3Format']>;

export interface SacCodesTable {
  insertion_order: AutoIncrement;
  code: string;
  name: string;
  substantive_function: SubstantiveFunction;
  definition: string;
  guideline: string;
  base_hours: number | null;
  cap_hours: number | null;
  postgraduate_cap_hours: number | null;
  pse_percentage: number | null;
  hours_per_unit_factor: number | null;
  unit_label: string | null;
  requires_vice_rector_approval: Flag;
  annex3_format: Annex3Format | null;
  applies_to: string;
  severity: RuleSeverity;
  mandatory_in_faculty: Flag | null;
  locked_by_research: Flag | null;
  created_at: DefaultTimestamp;
  updated_at: DefaultTimestamp;
}

export interface SacFacultyRulesTable {
  sac_code: string;
  unit_id: string;
  sort_order: number;
  min_teacher_hours: number | null;
  max_teacher_hours: number | null;
  faculty_bag_cap: number | null;
}

export interface TeachersTable {
  insertion_order: AutoIncrement;
  id: string;
  period_code: string;
  unit_id: string;
  document_id: string;
  full_name: string;
  dedication: TeacherDedication;
  expected_workload: number;
  academic_rank: string;
  education: string;
  is_provisional: Flag;
  seniority_years: number;
  pse_manual_override: number | null;
  shared_hours: number | null;
  shared_unit_name: string | null;
  general_note: string | null;
  version1_total: number | null;
  created_at: DefaultTimestamp;
  updated_at: DefaultTimestamp;
}

export interface TeacherAcademicSpacesTable {
  insertion_order: AutoIncrement;
  id: string;
  teacher_id: string;
  name: string;
  level: AssignedAcademicSpace['level'];
  monthly_hours: number;
  postgraduate_module_hours: number | null;
}

export interface TeacherCodeAllocationsTable {
  teacher_id: string;
  code: string;
  hours: number;
  version1_hours: number | null;
  unit_count: number | null;
  exception_justification: string | null;
  director_note: string | null;
  adjusted_by_director: Flag | null;
}

export interface ApprovalRequestsTable {
  insertion_order: AutoIncrement;
  id: string;
  period_code: string;
  unit_id: string;
  teacher_id: string;
  code: string;
  requested_hours: number;
  format_type: ApprovalRequestAnnex3['formatType'];
  program_name: string;
  attachment_url: string;
  status: ApprovalStatus;
  vice_rector_note: string | null;
  requested_at: Date;
  decided_by: string | null;
  decided_at: Date | null;
}

export interface ApprovalRequestProjectsTable {
  approval_request_id: string;
  sort_order: number;
  title: string;
  project_type: string;
  students_or_course: string;
  committee_approval_minute: string;
  hours: number;
}

export type SicddiLevel = NonNullable<ResearchAllocationAnnex7['sicddiLevel']>;

export interface ResearchAllocationsTable {
  insertion_order: AutoIncrement;
  id: string;
  period_code: string;
  unit_id: string;
  document_id: string;
  teacher_name: string;
  code: string;
  activity_name: string;
  project_or_group: string;
  research_role: string;
  sicddi_level: SicddiLevel | null;
  weekly_hours: number;
  monthly_hours: number;
  is_sicddi_locked: Flag;
  notes: string | null;
}

export interface AuditLogsTable {
  insertion_order: AutoIncrement;
  id: string;
  period_code: string;
  occurred_at: Date;
  actor_name: string;
  actor_role: string;
  unit_id: string | null;
  unit_name: string;
  teacher_name: string | null;
  action: string;
  previous_value: string | null;
  new_value: string | null;
  reason: string | null;
}

export interface UsersTable {
  insertion_order: AutoIncrement;
  id: string;
  username: string;
  email: string | null;
  entra_oid: string | null;
  auth_provider: ColumnType<AuthProvider, AuthProvider | undefined, AuthProvider | undefined>;
  password_hash: string;
  full_name: string;
  role: PayrollRole;
  unit_id: string | null;
  must_change_password: Flag;
  is_active: Flag;
  password_changed_at: Date | null;
  last_login_at: Date | null;
  created_at: DefaultTimestamp;
  updated_at: DefaultTimestamp;
}

export interface Database {
  academic_periods: AcademicPeriodsTable;
  business_rules: BusinessRulesTable;
  schedule_phases: SchedulePhasesTable;
  academic_units: AcademicUnitsTable;
  unit_payroll_cycles: UnitPayrollCyclesTable;
  academic_programs: AcademicProgramsTable;
  sac_codes: SacCodesTable;
  sac_faculty_rules: SacFacultyRulesTable;
  teachers: TeachersTable;
  teacher_academic_spaces: TeacherAcademicSpacesTable;
  teacher_code_allocations: TeacherCodeAllocationsTable;
  approval_requests: ApprovalRequestsTable;
  approval_request_projects: ApprovalRequestProjectsTable;
  research_allocations: ResearchAllocationsTable;
  audit_logs: AuditLogsTable;
  users: UsersTable;
}

/**
 * Query executor accepted by every repository method. A `Transaction<Database>`
 * is a `Kysely<Database>`, so repositories compose transparently inside a unit of work.
 */
export type DbExecutor = Kysely<Database>;

