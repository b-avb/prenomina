import type { Repositories } from '../repositories.js';
import { MariaDbAcademicProgramRepository } from './academic-program.mariadb-repository.js';
import { MariaDbAcademicUnitRepository } from './academic-unit.mariadb-repository.js';
import { MariaDbApprovalRequestRepository } from './approval-request.mariadb-repository.js';
import { MariaDbAuditLogRepository } from './audit-log.mariadb-repository.js';
import { MariaDbBusinessRulesRepository } from './business-rules.mariadb-repository.js';
import { MariaDbPeriodRepository } from './period.mariadb-repository.js';
import { MariaDbResearchAllocationRepository } from './research-allocation.mariadb-repository.js';
import { MariaDbSacCodeRepository } from './sac-code.mariadb-repository.js';
import { MariaDbSchedulePhaseRepository } from './schedule-phase.mariadb-repository.js';
import { MariaDbTeacherRepository } from './teacher.mariadb-repository.js';
import { MariaDbUserRepository } from './user.mariadb-repository.js';

export function createMariaDbRepositories(): Repositories {
  return {
    periods: new MariaDbPeriodRepository(),
    businessRules: new MariaDbBusinessRulesRepository(),
    schedulePhases: new MariaDbSchedulePhaseRepository(),
    units: new MariaDbAcademicUnitRepository(),
    programs: new MariaDbAcademicProgramRepository(),
    sacCodes: new MariaDbSacCodeRepository(),
    teachers: new MariaDbTeacherRepository(),
    approvals: new MariaDbApprovalRequestRepository(),
    research: new MariaDbResearchAllocationRepository(),
    auditLogs: new MariaDbAuditLogRepository(),
    users: new MariaDbUserRepository(),
  };
}

