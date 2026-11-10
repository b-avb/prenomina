import { sql, type Kysely } from 'kysely';

/**
 * Initial English schema for the faculty pre-payroll platform (Annexes 2–7).
 *
 * Scoping rules:
 *  - Global catalogs: `academic_units`, `academic_programs`, `sac_codes`.
 *  - Period-scoped data: `business_rules`, `schedule_phases`, `unit_payroll_cycles`, `teachers`
 *    (+ spaces and allocations), `approval_requests`, `research_allocations`, `audit_logs`.
 *  - `audit_logs` deliberately has no foreign keys: the trail must survive entity deletions.
 */
const TABLE_OPTIONS = sql.raw('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

const PAYROLL_STATUS_ENUM = sql.raw(
  "ENUM('Borrador','Enviada','En Revisión','Devuelta con Observaciones','Avalada')",
);
const ANNEX3_FORMAT_ENUM = sql.raw(
  "ENUM('10212','20223_20120','20222','40126','40222','43401')",
);
const ACADEMIC_LEVEL_ENUM = sql.raw("ENUM('Pregrado','Posgrado')");

const CREATE_STATEMENTS = [
  sql`CREATE TABLE academic_periods (
    code VARCHAR(16) NOT NULL,
    name VARCHAR(120) NOT NULL,
    status ENUM('ABIERTO','EN_CONSOLIDACION','CERRADO_SAC') NOT NULL DEFAULT 'ABIERTO',
    is_current TINYINT(1) NOT NULL DEFAULT 0,
    opened_at DATE NOT NULL,
    closed_at DATE NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (code),
    KEY idx_academic_periods_current (is_current)
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE business_rules (
    period_code VARCHAR(16) NOT NULL,
    include_postgraduate_in_pse125 TINYINT(1) NOT NULL DEFAULT 0,
    enforce_annex6_cap_on_graduates TINYINT(1) NOT NULL DEFAULT 1,
    block_submission_with_blocking_alerts TINYINT(1) NOT NULL DEFAULT 1,
    min_full_time_teaching_hours DECIMAL(8,2) NOT NULL DEFAULT 96,
    max_recommended_academic_spaces INT UNSIGNED NOT NULL DEFAULT 4,
    updated_by VARCHAR(160) NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (period_code),
    CONSTRAINT fk_business_rules_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE schedule_phases (
    id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    sort_order INT UNSIGNED NOT NULL,
    label VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date_range VARCHAR(120) NOT NULL,
    status ENUM('Completada','Activa','Programada') NOT NULL DEFAULT 'Programada',
    PRIMARY KEY (id),
    KEY idx_schedule_phases_period (period_code, sort_order),
    CONSTRAINT fk_schedule_phases_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE academic_units (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    division VARCHAR(160) NOT NULL,
    unit_type ENUM('Facultad','Dirección Académica') NOT NULL DEFAULT 'Facultad',
    has_postgraduates TINYINT(1) NOT NULL DEFAULT 0,
    dean_name VARCHAR(160) NOT NULL,
    quality_cap_30411 DECIMAL(8,2) NOT NULL DEFAULT 0,
    curriculum_cap_40106 DECIMAL(8,2) NOT NULL DEFAULT 0,
    sea_cap_40109 DECIMAL(8,2) NOT NULL DEFAULT 0,
    saber_pro_cap_40127 DECIMAL(8,2) NOT NULL DEFAULT 0,
    graduates_cap_20502 DECIMAL(8,2) NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_academic_units_insertion_order (insertion_order)
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE unit_payroll_cycles (
    unit_id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    payroll_status ${PAYROLL_STATUS_ENUM} NOT NULL DEFAULT 'Borrador',
    current_version INT UNSIGNED NOT NULL DEFAULT 1,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (unit_id, period_code),
    KEY idx_unit_payroll_cycles_period (period_code),
    CONSTRAINT fk_unit_payroll_cycles_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_unit_payroll_cycles_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE academic_programs (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    unit_id VARCHAR(64) NOT NULL,
    program_name VARCHAR(180) NOT NULL,
    level ${ACADEMIC_LEVEL_ENUM} NOT NULL DEFAULT 'Pregrado',
    modality ENUM('Presencial','Virtual','Híbrida') NOT NULL DEFAULT 'Presencial',
    accreditation_status VARCHAR(255) NOT NULL DEFAULT '',
    quality_30411 DECIMAL(8,2) NOT NULL DEFAULT 0,
    quality_notes VARCHAR(500) NULL,
    curriculum_40106 DECIMAL(8,2) NOT NULL DEFAULT 0,
    curriculum_notes VARCHAR(500) NULL,
    sea_40109 DECIMAL(8,2) NOT NULL DEFAULT 0,
    saber_pro_40127 DECIMAL(8,2) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_academic_programs_insertion_order (insertion_order),
    KEY idx_academic_programs_unit (unit_id),
    KEY idx_academic_programs_unit_active (unit_id, is_active),
    CONSTRAINT fk_academic_programs_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE sac_codes (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    substantive_function ENUM('Enseñanza-Aprendizaje','Proyección Social','Investigación','Gestión Académica') NOT NULL,
    definition TEXT NOT NULL,
    guideline TEXT NOT NULL,
    base_hours DECIMAL(8,2) NULL,
    cap_hours DECIMAL(8,2) NULL,
    postgraduate_cap_hours DECIMAL(8,2) NULL,
    pse_percentage DECIMAL(5,2) NULL,
    hours_per_unit_factor DECIMAL(8,2) NULL,
    unit_label VARCHAR(80) NULL,
    requires_vice_rector_approval TINYINT(1) NOT NULL DEFAULT 0,
    annex3_format ${ANNEX3_FORMAT_ENUM} NULL,
    applies_to VARCHAR(255) NOT NULL DEFAULT '',
    severity ENUM('blocking','justifiable_alert','informative') NOT NULL DEFAULT 'justifiable_alert',
    mandatory_in_faculty TINYINT(1) NULL,
    locked_by_research TINYINT(1) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (code),
    UNIQUE KEY uq_sac_codes_insertion_order (insertion_order)
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE sac_faculty_rules (
    sac_code VARCHAR(20) NOT NULL,
    unit_id VARCHAR(64) NOT NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    min_teacher_hours DECIMAL(8,2) NULL,
    max_teacher_hours DECIMAL(8,2) NULL,
    faculty_bag_cap DECIMAL(8,2) NULL,
    PRIMARY KEY (sac_code, unit_id),
    KEY idx_sac_faculty_rules_unit (unit_id),
    CONSTRAINT fk_sac_faculty_rules_code FOREIGN KEY (sac_code)
      REFERENCES sac_codes (code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sac_faculty_rules_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE teachers (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    unit_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(40) NOT NULL,
    full_name VARCHAR(180) NOT NULL,
    dedication ENUM('TC','MT','CATEDRA','DIRECTIVO') NOT NULL DEFAULT 'TC',
    expected_workload DECIMAL(8,2) NOT NULL DEFAULT 160,
    academic_rank VARCHAR(120) NOT NULL DEFAULT '',
    education VARCHAR(255) NOT NULL DEFAULT '',
    is_provisional TINYINT(1) NOT NULL DEFAULT 0,
    seniority_years INT UNSIGNED NOT NULL DEFAULT 0,
    pse_manual_override DECIMAL(8,2) NULL,
    shared_hours DECIMAL(8,2) NULL,
    shared_unit_name VARCHAR(160) NULL,
    general_note TEXT NULL,
    version1_total DECIMAL(8,2) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_teachers_insertion_order (insertion_order),
    UNIQUE KEY uq_teachers_period_unit_document (period_code, unit_id, document_id),
    KEY idx_teachers_period_unit (period_code, unit_id),
    KEY idx_teachers_period_document (period_code, document_id),
    KEY idx_teachers_unit (unit_id),
    CONSTRAINT fk_teachers_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE teacher_academic_spaces (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    teacher_id VARCHAR(64) NOT NULL,
    name VARCHAR(200) NOT NULL,
    level ${ACADEMIC_LEVEL_ENUM} NOT NULL DEFAULT 'Pregrado',
    monthly_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    postgraduate_module_hours DECIMAL(8,2) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teacher_academic_spaces_insertion_order (insertion_order),
    KEY idx_teacher_academic_spaces_teacher (teacher_id),
    CONSTRAINT fk_teacher_academic_spaces_teacher FOREIGN KEY (teacher_id)
      REFERENCES teachers (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE teacher_code_allocations (
    teacher_id VARCHAR(64) NOT NULL,
    code VARCHAR(20) NOT NULL,
    hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    version1_hours DECIMAL(8,2) NULL,
    unit_count INT UNSIGNED NULL,
    exception_justification TEXT NULL,
    director_note TEXT NULL,
    adjusted_by_director TINYINT(1) NULL,
    PRIMARY KEY (teacher_id, code),
    KEY idx_teacher_code_allocations_code (code),
    CONSTRAINT fk_teacher_code_allocations_teacher FOREIGN KEY (teacher_id)
      REFERENCES teachers (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teacher_code_allocations_code FOREIGN KEY (code)
      REFERENCES sac_codes (code) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE approval_requests (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    unit_id VARCHAR(64) NOT NULL,
    teacher_id VARCHAR(64) NOT NULL,
    code VARCHAR(20) NOT NULL,
    requested_hours DECIMAL(8,2) NOT NULL,
    format_type ${ANNEX3_FORMAT_ENUM} NOT NULL,
    program_name VARCHAR(180) NOT NULL DEFAULT '',
    attachment_url VARCHAR(500) NOT NULL DEFAULT '',
    status ENUM('Pendiente','Avalado','Con Observaciones','Rechazado') NOT NULL DEFAULT 'Pendiente',
    vice_rector_note TEXT NULL,
    requested_at DATETIME(3) NOT NULL,
    decided_by VARCHAR(255) NULL,
    decided_at DATETIME(3) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_approval_requests_insertion_order (insertion_order),
    UNIQUE KEY uq_approval_requests_teacher_code (teacher_id, code),
    KEY idx_approval_requests_period_unit_status (period_code, unit_id, status),
    KEY idx_approval_requests_code (code),
    CONSTRAINT fk_approval_requests_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_approval_requests_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_approval_requests_teacher FOREIGN KEY (teacher_id)
      REFERENCES teachers (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_approval_requests_code FOREIGN KEY (code)
      REFERENCES sac_codes (code) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE approval_request_projects (
    approval_request_id VARCHAR(64) NOT NULL,
    sort_order INT UNSIGNED NOT NULL,
    title VARCHAR(500) NOT NULL,
    project_type VARCHAR(160) NOT NULL DEFAULT '',
    students_or_course VARCHAR(300) NOT NULL DEFAULT '',
    committee_approval_minute VARCHAR(255) NOT NULL DEFAULT '',
    hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (approval_request_id, sort_order),
    CONSTRAINT fk_approval_request_projects_request FOREIGN KEY (approval_request_id)
      REFERENCES approval_requests (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE research_allocations (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    unit_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(40) NOT NULL,
    teacher_name VARCHAR(180) NOT NULL,
    code VARCHAR(20) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    project_or_group VARCHAR(255) NOT NULL DEFAULT '',
    research_role VARCHAR(120) NOT NULL DEFAULT '',
    sicddi_level ENUM('Nivel I (20h)','Nivel II (80h)','Nivel III (136h)') NULL,
    weekly_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    monthly_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    is_sicddi_locked TINYINT(1) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_research_allocations_insertion_order (insertion_order),
    KEY idx_research_allocations_period_unit (period_code, unit_id),
    KEY idx_research_allocations_period_document (period_code, document_id),
    CONSTRAINT fk_research_allocations_period FOREIGN KEY (period_code)
      REFERENCES academic_periods (code) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_research_allocations_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_research_allocations_code FOREIGN KEY (code)
      REFERENCES sac_codes (code) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`,

  sql`CREATE TABLE audit_logs (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    period_code VARCHAR(16) NOT NULL,
    occurred_at DATETIME(3) NOT NULL,
    actor_name VARCHAR(160) NOT NULL,
    actor_role VARCHAR(120) NOT NULL,
    unit_id VARCHAR(64) NULL,
    unit_name VARCHAR(160) NOT NULL,
    teacher_name VARCHAR(180) NULL,
    action VARCHAR(255) NOT NULL,
    previous_value TEXT NULL,
    new_value TEXT NULL,
    reason TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_audit_logs_insertion_order (insertion_order),
    KEY idx_audit_logs_occurred_at (occurred_at),
    KEY idx_audit_logs_period_occurred_at (period_code, occurred_at),
    KEY idx_audit_logs_unit_occurred_at (unit_id, occurred_at)
  ) ${TABLE_OPTIONS}`,
];

const TABLES_IN_DEPENDENCY_ORDER = [
  'academic_periods',
  'business_rules',
  'schedule_phases',
  'academic_units',
  'unit_payroll_cycles',
  'academic_programs',
  'sac_codes',
  'sac_faculty_rules',
  'teachers',
  'teacher_academic_spaces',
  'teacher_code_allocations',
  'approval_requests',
  'approval_request_projects',
  'research_allocations',
  'audit_logs',
] as const;

export async function up(db: Kysely<unknown>): Promise<void> {
  for (const statement of CREATE_STATEMENTS) {
    await statement.execute(db);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const table of [...TABLES_IN_DEPENDENCY_ORDER].reverse()) {
    await db.schema.dropTable(table).ifExists().execute();
  }
}
