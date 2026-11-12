import type {
  ApprovalAttachmentResponse,
  ApprovalRequestAnnex3,
  CreateApprovalRequestDto,
  DecideApprovalDto,
  UploadApprovalAttachmentDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createApprovalsApi(http: HttpClient) {
  return {
    /** POST /api/approvals?period= — upserts the pending request for (teacherId, code). */
    create: (period: string, dto: CreateApprovalRequestDto) =>
      http.post<ApprovalRequestAnnex3>('/api/approvals', dto, { period }),
    /** POST /api/approvals/attachments — stores Annex 3 support document and returns its internal URL. */
    uploadAttachment: (dto: UploadApprovalAttachmentDto) =>
      http.post<ApprovalAttachmentResponse>('/api/approvals/attachments', dto),
    /** GET /api/approvals/attachments/:fileName — downloads authenticated binary attachment. */
    downloadAttachmentBlob: (fileName: string) =>
      http.fetchBlob(`/api/approvals/attachments/${encodeURIComponent(fileName)}`),
    /** PATCH /api/approvals/:id/decision — `decidedBy` comes from the verified JWT actor. */
    decide: ({ id, ...body }: DecideApprovalDto) =>
      http.patch<ApprovalRequestAnnex3>(
        `/api/approvals/${encodeURIComponent(id)}/decision`,
        body,
      ),
  };
}

export type ApprovalsApi = ReturnType<typeof createApprovalsApi>;
