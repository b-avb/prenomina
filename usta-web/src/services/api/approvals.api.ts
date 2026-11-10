import type {
  ApprovalRequestAnnex3,
  CreateApprovalRequestDto,
  DecideApprovalDto,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createApprovalsApi(http: HttpClient) {
  return {
    /** POST /api/approvals?period= — upserts the pending request for (teacherId, code). */
    create: (period: string, dto: CreateApprovalRequestDto) =>
      http.post<ApprovalRequestAnnex3>('/api/approvals', dto, { period }),
    /** PATCH /api/approvals/:id/decision — `decidedBy` comes from the actor headers. */
    decide: ({ id, ...body }: DecideApprovalDto) =>
      http.patch<ApprovalRequestAnnex3>(
        `/api/approvals/${encodeURIComponent(id)}/decision`,
        body,
      ),
  };
}

export type ApprovalsApi = ReturnType<typeof createApprovalsApi>;
