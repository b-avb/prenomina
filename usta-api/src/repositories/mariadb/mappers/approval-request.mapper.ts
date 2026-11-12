import type { Insertable, Selectable } from 'kysely';
import type { ApprovalProjectDetail, ApprovalRequestAnnex3 } from '@usta/domain';
import type {
  ApprovalRequestProjectsTable,
  ApprovalRequestsTable,
} from '../../../database/database.types.js';
import { definedProps, nullable, toIsoString } from './mapper.utils.js';

/** Joined `approval_requests` row enriched with unit, teacher, and SAC code labels. */
export type ApprovalRequestRow = Selectable<ApprovalRequestsTable> & {
  unit_name: string;
  teacher_name: string;
  teacher_document_id: string;
  code_name: string;
};

export type ApprovalRequestProjectRow = Selectable<ApprovalRequestProjectsTable>;

export function toApprovalProjectDetail(
  row: ApprovalRequestProjectRow,
): ApprovalProjectDetail {
  return {
    title: row.title,
    projectType: row.project_type,
    studentsOrCourse: row.students_or_course,
    committeeApprovalMinute: row.committee_approval_minute,
    hours: row.hours,
  };
}

export function toApprovalRequest(
  row: ApprovalRequestRow,
  projects: ApprovalProjectDetail[],
): ApprovalRequestAnnex3 {
  return {
    id: row.id,
    period: row.period_code,
    unitId: row.unit_id,
    unitName: row.unit_name,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    teacherDocumentId: row.teacher_document_id,
    code: row.code,
    codeName: row.code_name,
    requestedHours: row.requested_hours,
    formatType: row.format_type,
    programName: row.program_name,
    projectDetails: projects,
    attachmentUrl: row.attachment_url,
    status: row.status,
    requestedAt: toIsoString(row.requested_at),
    ...definedProps({
      viceRectorNote: row.vice_rector_note,
      decidedBy: row.decided_by,
      decidedAt: row.decided_at ? toIsoString(row.decided_at) : null,
    }),
  };
}

export function toApprovalRequestRow(
  request: ApprovalRequestAnnex3,
): Omit<Insertable<ApprovalRequestsTable>, 'insertion_order'> {
  return {
    id: request.id,
    period_code: request.period,
    unit_id: request.unitId,
    teacher_id: request.teacherId,
    code: request.code,
    requested_hours: request.requestedHours,
    format_type: request.formatType,
    program_name: request.programName,
    attachment_url: request.attachmentUrl,
    status: request.status,
    vice_rector_note: nullable(request.viceRectorNote),
    requested_at: new Date(request.requestedAt),
    decided_by: nullable(request.decidedBy),
    decided_at: request.decidedAt ? new Date(request.decidedAt) : null,
  };
}

export function toApprovalRequestProjectRows(
  request: ApprovalRequestAnnex3,
): Insertable<ApprovalRequestProjectsTable>[] {
  return request.projectDetails.map((item, idx) => ({
    approval_request_id: request.id,
    sort_order: idx,
    title: item.title,
    project_type: item.projectType,
    students_or_course: item.studentsOrCourse,
    committee_approval_minute: item.committeeApprovalMinute,
    hours: item.hours,
  }));
}
