import type { Insertable, Selectable } from 'kysely';
import type { ProgramQuotaAnnex5 } from '@usta/domain';
import type { AcademicProgramsTable } from '../../../database/database.types.js';
import type { AcademicProgramRecord } from '../../../models/persistence.models.js';
import { definedProps, fromFlag, nullable, toFlag } from './mapper.utils.js';

export type AcademicProgramRow = Selectable<AcademicProgramsTable> & { unit_name: string };

export function toAcademicProgram(row: AcademicProgramRow): ProgramQuotaAnnex5 {
  return {
    id: row.id,
    unitId: row.unit_id,
    unitName: row.unit_name,
    programName: row.program_name,
    level: row.level,
    modality: row.modality,
    accreditationStatus: row.accreditation_status,
    quality30411: row.quality_30411,
    curriculum40106: row.curriculum_40106,
    sea40109: row.sea_40109,
    saberPro40127: row.saber_pro_40127,
    isActive: fromFlag(row.is_active),
    ...definedProps({ qualityNotes: row.quality_notes, curriculumNotes: row.curriculum_notes }),
  };
}

export function toAcademicProgramRow(
  program: AcademicProgramRecord,
): Omit<Insertable<AcademicProgramsTable>, 'insertion_order' | 'created_at' | 'updated_at'> {
  return {
    id: program.id,
    unit_id: program.unitId,
    program_name: program.programName,
    level: program.level,
    modality: program.modality,
    accreditation_status: program.accreditationStatus,
    quality_30411: program.quality30411,
    quality_notes: nullable(program.qualityNotes),
    curriculum_40106: program.curriculum40106,
    curriculum_notes: nullable(program.curriculumNotes),
    sea_40109: program.sea40109,
    saber_pro_40127: program.saberPro40127,
    is_active: toFlag(program.isActive),
  };
}
