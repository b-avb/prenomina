import type { Insertable, Selectable } from 'kysely';
import type { FacultySpecificRule, SacCode } from '@usta/domain';
import type { SacCodesTable, SacFacultyRulesTable } from '../../../database/database.types.js';
import {
  definedProps,
  fromFlag,
  fromNullableFlag,
  nullable,
  toFlag,
  toNullableFlag,
} from './mapper.utils.js';

/** Joined `sac_faculty_rules` row enriched with `academic_units.name` (Anexo 4). */
export type SacFacultyRuleRow = Selectable<SacFacultyRulesTable> & { unit_name: string };

export function toFacultySpecificRule(row: SacFacultyRuleRow): FacultySpecificRule {
  return {
    unitId: row.unit_id,
    unitName: row.unit_name,
    minTeacherHours: row.min_teacher_hours,
    maxTeacherHours: row.max_teacher_hours,
    facultyBagCap: row.faculty_bag_cap,
  };
}

export function toSacCode(row: Selectable<SacCodesTable>, facultyRules: FacultySpecificRule[]): SacCode {
  return {
    code: row.code,
    name: row.name,
    substantiveFunction: row.substantive_function,
    definition: row.definition,
    guideline: row.guideline,
    baseHours: row.base_hours,
    capHours: row.cap_hours,
    requiresViceRectorApproval: fromFlag(row.requires_vice_rector_approval),
    appliesTo: row.applies_to,
    severity: row.severity,
    ...definedProps({
      postgraduateCapHours: row.postgraduate_cap_hours,
      psePercentage: row.pse_percentage,
      hoursPerUnitFactor: row.hours_per_unit_factor,
      unitLabel: row.unit_label,
      annex3Format: row.annex3_format,
      mandatoryInFaculty: fromNullableFlag(row.mandatory_in_faculty),
      lockedByResearch: fromNullableFlag(row.locked_by_research),
    }),
    ...(facultyRules.length > 0 ? { facultyRules } : {}),
  };
}

export function toSacCodeRow(
  code: SacCode,
): Omit<Insertable<SacCodesTable>, 'insertion_order' | 'created_at' | 'updated_at'> {
  return {
    code: code.code,
    name: code.name,
    substantive_function: code.substantiveFunction,
    definition: code.definition,
    guideline: code.guideline,
    base_hours: code.baseHours,
    cap_hours: code.capHours,
    postgraduate_cap_hours: nullable(code.postgraduateCapHours),
    pse_percentage: nullable(code.psePercentage),
    hours_per_unit_factor: nullable(code.hoursPerUnitFactor),
    unit_label: nullable(code.unitLabel),
    requires_vice_rector_approval: toFlag(code.requiresViceRectorApproval),
    annex3_format: nullable(code.annex3Format),
    applies_to: code.appliesTo,
    severity: code.severity,
    mandatory_in_faculty: toNullableFlag(code.mandatoryInFaculty),
    locked_by_research: toNullableFlag(code.lockedByResearch),
  };
}

export function toSacFacultyRuleRows(code: SacCode): Insertable<SacFacultyRulesTable>[] {
  return (code.facultyRules ?? []).map((rule, index) => ({
    sac_code: code.code,
    unit_id: rule.unitId,
    sort_order: index,
    min_teacher_hours: rule.minTeacherHours,
    max_teacher_hours: rule.maxTeacherHours,
    faculty_bag_cap: nullable(rule.facultyBagCap),
  }));
}
