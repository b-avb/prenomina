import type { AcademicProgramRepository } from './academic-program.repository.js';
import type { AcademicUnitRepository } from './academic-unit.repository.js';
import type { ApprovalRequestRepository } from './approval-request.repository.js';
import type { AuditLogRepository } from './audit-log.repository.js';
import type { BusinessRulesRepository } from './business-rules.repository.js';
import type { PeriodRepository } from './period.repository.js';
import type { ResearchAllocationRepository } from './research-allocation.repository.js';
import type { SacCodeRepository } from './sac-code.repository.js';
import type { SchedulePhaseRepository } from './schedule-phase.repository.js';
import type { TeacherRepository } from './teacher.repository.js';
import type { UserRepository } from './user.repository.js';

/** Registry of every repository port, wired once by the composition root. */
export interface Repositories {
  periods: PeriodRepository;
  businessRules: BusinessRulesRepository;
  schedulePhases: SchedulePhaseRepository;
  units: AcademicUnitRepository;
  programs: AcademicProgramRepository;
  sacCodes: SacCodeRepository;
  teachers: TeacherRepository;
  approvals: ApprovalRequestRepository;
  research: ResearchAllocationRepository;
  auditLogs: AuditLogRepository;
  users: UserRepository;
}

