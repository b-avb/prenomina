import type { Insertable, Selectable } from 'kysely';
import type { AssignedAcademicSpace, FacultyTeacher, TeacherCodeAllocation } from '@usta/domain';
import type {
  TeacherAcademicSpacesTable,
  TeacherCodeAllocationsTable,
  TeachersTable,
} from '../../../database/database.types.js';
import {
  definedProps,
  fromFlag,
  fromNullableFlag,
  nullable,
  toFlag,
  toNullableFlag,
} from './mapper.utils.js';

type TeacherProfileRow = Omit<Insertable<TeachersTable>, 'insertion_order' | 'created_at' | 'updated_at'>;

export function toAssignedAcademicSpace(row: Selectable<TeacherAcademicSpacesTable>): AssignedAcademicSpace {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    monthlyHours: row.monthly_hours,
    ...definedProps({ postgraduateModuleHours: row.postgraduate_module_hours }),
  };
}

export function toTeacherCodeAllocation(row: Selectable<TeacherCodeAllocationsTable>): TeacherCodeAllocation {
  return {
    code: row.code,
    hours: row.hours,
    ...definedProps({
      programId: row.program_id,
      programName: row.program_name,
      version1Hours: row.version1_hours,
      unitCount: row.unit_count,
      exceptionJustification: row.exception_justification,
      directorNote: row.director_note,
      adjustedByDirector: fromNullableFlag(row.adjusted_by_director),
    }),
  };
}

export function toFacultyTeacher(
  row: Selectable<TeachersTable>,
  academicSpaces: AssignedAcademicSpace[],
  allocations: TeacherCodeAllocation[],
): FacultyTeacher {
  return {
    id: row.id,
    unitId: row.unit_id,
    documentId: row.document_id,
    fullName: row.full_name,
    dedication: row.dedication,
    expectedWorkload: row.expected_workload,
    rank: row.academic_rank,
    education: row.education,
    isProvisional: fromFlag(row.is_provisional),
    seniorityYears: row.seniority_years,
    academicSpaces,
    pseManualOverride: row.pse_manual_override,
    allocations: Object.fromEntries(allocations.map((allocation) => [allocation.code, allocation])),
    ...definedProps({
      sharedHours: row.shared_hours,
      sharedUnitName: row.shared_unit_name,
      generalNote: row.general_note,
      version1Total: row.version1_total,
    }),
  };
}

export function toTeacherProfileColumns(
  teacher: FacultyTeacher,
): Omit<TeacherProfileRow, 'id' | 'period_code' | 'unit_id'> {
  return {
    document_id: teacher.documentId,
    full_name: teacher.fullName,
    dedication: teacher.dedication,
    expected_workload: teacher.expectedWorkload,
    academic_rank: teacher.rank,
    education: teacher.education,
    is_provisional: toFlag(teacher.isProvisional),
    seniority_years: teacher.seniorityYears,
    pse_manual_override: teacher.pseManualOverride ?? null,
    shared_hours: nullable(teacher.sharedHours),
    shared_unit_name: nullable(teacher.sharedUnitName),
    general_note: nullable(teacher.generalNote),
    version1_total: nullable(teacher.version1Total),
  };
}

export function toTeacherRow(periodCode: string, teacher: FacultyTeacher): TeacherProfileRow {
  return {
    id: teacher.id,
    period_code: periodCode,
    unit_id: teacher.unitId,
    ...toTeacherProfileColumns(teacher),
  };
}

export function toAcademicSpaceRows(
  teacher: FacultyTeacher,
): Omit<Insertable<TeacherAcademicSpacesTable>, 'insertion_order'>[] {
  return teacher.academicSpaces.map((space) => ({
    id: space.id,
    teacher_id: teacher.id,
    name: space.name,
    level: space.level,
    monthly_hours: space.monthlyHours,
    postgraduate_module_hours: nullable(space.postgraduateModuleHours),
  }));
}

export function toAllocationRows(teacher: FacultyTeacher): Insertable<TeacherCodeAllocationsTable>[] {
  return Object.entries(teacher.allocations).map(([code, allocation]) => ({
    teacher_id: teacher.id,
    code,
    hours: allocation.hours,
    program_id: nullable(allocation.programId),
    program_name: nullable(allocation.programName),
    version1_hours: nullable(allocation.version1Hours),
    unit_count: nullable(allocation.unitCount),
    exceptionJustification: undefined,
    exception_justification: nullable(allocation.exceptionJustification),
    director_note: nullable(allocation.directorNote),
    adjusted_by_director: toNullableFlag(allocation.adjustedByDirector),
  })).map(({ exceptionJustification: _unused, ...rest }) => rest);
}
