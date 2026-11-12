import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ActorContext,
  ApprovalStatus,
  CreateApprovalRequestDto,
  DecideApprovalDto,
  UploadApprovalAttachmentDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { ApprovalsService } from '../services/approvals.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendBinary,
  sendSuccess,
} from '../utils/http.utils.js';
import {
  ANNEX3_FORMATS,
  APPROVAL_STATUSES,
  isOneOf,
} from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

/**
 * HTTP handlers for Annex 3 Vice-Rectorate pre-approval requests, supporting PDF attachments,
 * and approval decisions (`Avalado`, `Con Observaciones`, `Rechazado`).
 */
export class ApprovalsController {
  constructor(
    private readonly service: ApprovalsService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public list = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor = resolvedActor ?? (await this.actorResolver.resolve(req));
    const period = optionalQueryParam(url, 'period', req);
    const unitId = optionalQueryParam(url, 'unitId');
    const rawStatus = optionalQueryParam(url, 'status');
    const status: ApprovalStatus | undefined = isOneOf(rawStatus, APPROVAL_STATUSES)
      ? rawStatus
      : undefined;
    const items = await this.service.list(period, unitId, status, actor);
    sendSuccess(res, 200, items);
  };

  /** Accepts a base64-encoded PDF payload (`<= 15M` characters / `12 MB` decoded) and stores it under `UPLOADS_DIR/annex3`. */
  public uploadAttachment = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UploadApprovalAttachmentDto>(raw, (r) => ({
      fileName: r.requiredString('fileName', { maxLength: 200 }),
      mimeType: r.optionalString('mimeType', { maxLength: 120 }) ?? '',
      contentBase64: r.requiredString('contentBase64', { maxLength: 15_000_000 }),
    }));
    const uploaded = await this.service.uploadAttachment(actor, dto);
    sendSuccess(res, 201, uploaded);
  };

  /** Streams a stored Annex 3 PDF attachment after verifying the actor's unit access to any referencing approval request. */
  public getAttachment = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor = resolvedActor ?? (await this.actorResolver.resolve(req));
    const fileName = requirePathParam(params, 'fileName', { maxLength: 160 });
    const file = await this.service.readAttachment(fileName, actor);
    sendBinary(res, 200, file.buffer, file.mimeType, file.fileName);
  };

  /** Submits or updates an Annex 3 pre-approval request for `(teacherId, code)`. */
  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
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

  /** Records the Academic Vice-Rectorate decision on an Annex 3 request; synchronizes teacher SAC hours when `Avalado`. */
  public decide = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.approvalDecision));
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
