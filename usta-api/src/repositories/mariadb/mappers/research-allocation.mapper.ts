import type { Insertable, Selectable } from 'kysely';
import type { ResearchAllocationAnnex7 } from '@usta/domain';
import type { ResearchAllocationsTable } from '../../../database/database.types.js';
import { definedProps, fromFlag, nullable, toFlag } from './mapper.utils.js';

/** Joined `research_allocations` row enriched with `academic_units.name` (Anexo 7). */
export type ResearchAllocationRow = Selectable<ResearchAllocationsTable> & { unit_name: string };

export function toResearchAllocation(row: ResearchAllocationRow): ResearchAllocationAnnex7 {
  return {
    id: row.id,
    period: row.period_code,
    unitId: row.unit_id,
    unitName: row.unit_name,
    documentId: row.document_id,
    teacherName: row.teacher_name,
    code: row.code,
    activityName: row.activity_name,
    projectOrGroup: row.project_or_group,
    role: row.research_role,
    sicddiLevel: row.sicddi_level,
    weeklyHours: row.weekly_hours,
    monthlyHours: row.monthly_hours,
    isSicddiLocked: fromFlag(row.is_sicddi_locked),
    ...definedProps({ notes: row.notes }),
  };
}

export function toResearchAllocationRow(
  allocation: ResearchAllocationAnnex7,
): Omit<Insertable<ResearchAllocationsTable>, 'insertion_order'> {
  return {
    id: allocation.id,
    period_code: allocation.period,
    unit_id: allocation.unitId,
    document_id: allocation.documentId,
    teacher_name: allocation.teacherName,
    code: allocation.code,
    activity_name: allocation.activityName,
    project_or_group: allocation.projectOrGroup,
    research_role: allocation.role,
    sicddi_level: allocation.sicddiLevel ?? null,
    weekly_hours: allocation.weeklyHours,
    monthly_hours: allocation.monthlyHours,
    is_sicddi_locked: toFlag(allocation.isSicddiLocked),
    notes: nullable(allocation.notes),
  };
}
