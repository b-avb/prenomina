import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ApprovalStatus,
  CreateApprovalRequestDto,
  DecideApprovalDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { ApprovalsService } from '../services/approvals.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import {
  ANNEX3_FORMATS,
  APPROVAL_STATUSES,
  isOneOf,
} from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

export class ApprovalsController {
  constructor(
    private readonly service: ApprovalsService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public list = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period', req);
    const unitId = optionalQueryParam(url, 'unitId');
    const rawStatus = optionalQueryParam(url, 'status');
    const status: ApprovalStatus | undefined = isOneOf(rawStatus, APPROVAL_STATUSES)
      ? rawStatus
      : undefined;
    const items = await this.service.list(period, unitId, status);
    sendSuccess(res, 200, items);
  };

  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateApprovalRequestDto>(raw, (r) => ({
      unitId: r.requiredString('unitId', { maxLength: 64 }),
      unitName: r.requiredString('unitName', { maxLength: 160 }),
      teacherId: r.requiredString('teacherId', { maxLength: 64 }),
      teacherName: r.requiredString('teacherName', { maxLength: 200 }),
      teacherDocumentId: r.requiredString('teacherDocumentId', { maxLength: 40 }),
      code: r.requiredString('code', { maxLength: 16 }),
      codeName: r.requiredString('codeName', { maxLength: 200 }),
      requestedHours: r.requiredNumber('requestedHours', { min: 0 }),
      formatType: r.requiredEnum('formatType', ANNEX3_FORMATS),
      programName: r.optionalString('programName', { maxLength: 200 }) ?? '',
      projectDetails: r.objectArray('projectDetails', (item) => ({
        title: item.requiredString('title', { maxLength: 300 }),
        projectType: item.optionalString('projectType', { maxLength: 160 }) ?? '',
        studentsOrCourse:
          item.optionalString('studentsOrCourse', { maxLength: 255 }) ?? '',
        committeeApprovalMinute:
          item.optionalString('committeeApprovalMinute', { maxLength: 160 }) ?? '',
        hours: item.requiredNumber('hours', { min: 0 }),
      })),
      attachmentUrl: r.optionalString('attachmentUrl', { maxLength: 500 }) ?? '',
    }));
    const created = await this.service.create(actor, dto, period);
    sendSuccess(res, 201, created);
  };

  public decide = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.approvalDecision);
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<DecideApprovalDto>(raw, (r) => ({
      id,
      status: r.requiredEnum('status', APPROVAL_STATUSES),
      ...(r.has('viceRectorNote')
        ? {
            viceRectorNote: r.optionalString('viceRectorNote', { maxLength: 1000 }),
          }
        : {}),
    }));
    const updated = await this.service.decide(actor, dto);
    sendSuccess(res, 200, updated);
  };
}
