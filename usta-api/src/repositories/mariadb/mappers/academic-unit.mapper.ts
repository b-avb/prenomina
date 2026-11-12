import type { Insertable, Selectable } from 'kysely';
import type { AcademicUnitsTable, UnitPayrollCyclesTable } from '../../../database/database.types.js';
import type { AcademicUnitRecord, UnitPayrollCycle } from '../../../models/persistence.models.js';
import { fromFlag, toFlag, toIsoString } from './mapper.utils.js';

/** Maps `academic_units` and `unit_payroll_cycles` rows to persistence records and back. */
export function toAcademicUnitRecord(row: Selectable<AcademicUnitsTable>): AcademicUnitRecord {
  return {
    id: row.id,
    name: row.name,
    division: row.division,
    unitType: row.unit_type,
    hasPostgraduates: fromFlag(row.has_postgraduates),
    deanName: row.dean_name,
    qualityCap30411: row.quality_cap_30411,
    curriculumCap40106: row.curriculum_cap_40106,
    seaCap40109: row.sea_cap_40109,
    saberProCap40127: row.saber_pro_cap_40127,
    graduatesCap20502: row.graduates_cap_20502,
    updatedAt: toIsoString(row.updated_at),
  };
}

/** Profile columns shared by insert and update (timestamps are managed by the database). */
export function toAcademicUnitRow(
  unit: AcademicUnitRecord,
): Omit<Insertable<AcademicUnitsTable>, 'insertion_order' | 'created_at' | 'updated_at'> {
  return {
    id: unit.id,
    name: unit.name,
    division: unit.division,
    unit_type: unit.unitType,
    has_postgraduates: toFlag(unit.hasPostgraduates),
    dean_name: unit.deanName,
    quality_cap_30411: unit.qualityCap30411,
    curriculum_cap_40106: unit.curriculumCap40106,
    sea_cap_40109: unit.seaCap40109,
    saber_pro_cap_40127: unit.saberProCap40127,
    graduates_cap_20502: unit.graduatesCap20502,
  };
}

export function toUnitPayrollCycle(row: Selectable<UnitPayrollCyclesTable>): UnitPayrollCycle {
  return {
    unitId: row.unit_id,
    periodCode: row.period_code,
    payrollStatus: row.payroll_status,
    currentVersion: row.current_version,
    updatedAt: toIsoString(row.updated_at),
  };
}

export function toUnitPayrollCycleRow(cycle: UnitPayrollCycle): Insertable<UnitPayrollCyclesTable> {
  return {
    unit_id: cycle.unitId,
    period_code: cycle.periodCode,
    payroll_status: cycle.payrollStatus,
    current_version: cycle.currentVersion,
    updated_at: new Date(cycle.updatedAt),
  };
}
