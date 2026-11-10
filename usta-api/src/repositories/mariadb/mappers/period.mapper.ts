import type { Insertable, Selectable } from 'kysely';
import type { AcademicPeriod, BusinessRulesConfig, SchedulePhase } from '@usta/domain';
import type {
  AcademicPeriodsTable,
  BusinessRulesTable,
  SchedulePhasesTable,
} from '../../../database/database.types.js';
import { fromFlag, toDateOnly, toFlag } from './mapper.utils.js';

const parseDateOnly = (value: string): Date => new Date(`${value.slice(0, 10)}T00:00:00.000Z`);

export function toAcademicPeriod(row: Selectable<AcademicPeriodsTable>): AcademicPeriod {
  return {
    code: row.code,
    name: row.name,
    status: row.status,
    isCurrent: fromFlag(row.is_current),
    openedAt: toDateOnly(row.opened_at),
    closedAt: row.closed_at ? toDateOnly(row.closed_at) : null,
  };
}

export function toAcademicPeriodRow(period: AcademicPeriod): Insertable<AcademicPeriodsTable> {
  return {
    code: period.code,
    name: period.name,
    status: period.status,
    is_current: toFlag(period.isCurrent),
    opened_at: parseDateOnly(period.openedAt),
    closed_at: period.closedAt ? parseDateOnly(period.closedAt) : null,
  };
}

export function toBusinessRules(row: Selectable<BusinessRulesTable>): BusinessRulesConfig {
  return {
    includePostgraduateInPse125: fromFlag(row.include_postgraduate_in_pse125),
    enforceAnnex6CapOnGraduates: fromFlag(row.enforce_annex6_cap_on_graduates),
    blockSubmissionWithBlockingAlerts: fromFlag(row.block_submission_with_blocking_alerts),
    minFullTimeTeachingHours: row.min_full_time_teaching_hours,
    maxRecommendedAcademicSpaces: row.max_recommended_academic_spaces,
  };
}

export function toBusinessRulesRow(
  periodCode: string,
  rules: BusinessRulesConfig,
  updatedBy: string,
): Insertable<BusinessRulesTable> {
  return {
    period_code: periodCode,
    include_postgraduate_in_pse125: toFlag(rules.includePostgraduateInPse125),
    enforce_annex6_cap_on_graduates: toFlag(rules.enforceAnnex6CapOnGraduates),
    block_submission_with_blocking_alerts: toFlag(rules.blockSubmissionWithBlockingAlerts),
    min_full_time_teaching_hours: rules.minFullTimeTeachingHours,
    max_recommended_academic_spaces: rules.maxRecommendedAcademicSpaces,
    updated_by: updatedBy,
    updated_at: new Date(),
  };
}

export function toSchedulePhase(row: Selectable<SchedulePhasesTable>): SchedulePhase {
  return {
    id: row.id,
    label: row.label,
    title: row.title,
    dateRange: row.date_range,
    status: row.status,
  };
}

export function toSchedulePhaseRow(
  periodCode: string,
  phase: SchedulePhase,
  sortOrder: number,
): Insertable<SchedulePhasesTable> {
  return {
    id: phase.id,
    period_code: periodCode,
    sort_order: sortOrder,
    label: phase.label,
    title: phase.title,
    date_range: phase.dateRange,
    status: phase.status,
  };
}
