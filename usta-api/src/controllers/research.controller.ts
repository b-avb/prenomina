import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ActorContext,
  CreateResearchAllocationDto,
  UpdateResearchAllocationDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { ResearchService } from '../services/research.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import { SICDDI_LEVELS } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

export class ResearchController {
  constructor(
    private readonly service: ResearchService,
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
    const items = await this.service.list(period, unitId, actor);
    sendSuccess(res, 200, items);
  };

  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.research));
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateResearchAllocationDto>(raw, (r) => ({
      unitId: r.requiredString('unitId', { maxLength: 64 }),
      unitName: r.optionalString('unitName', { maxLength: 160 }) ?? '',
      documentId: r.requiredString('documentId', { maxLength: 40 }),
      teacherName: r.requiredString('teacherName', { maxLength: 200 }),
      code: r.requiredString('code', { maxLength: 16 }),
      activityName: r.requiredString('activityName', { maxLength: 200 }),
      projectOrGroup: r.requiredString('projectOrGroup', { maxLength: 300 }),
      role: r.requiredString('role', { maxLength: 160 }),
      sicddiLevel: r.optionalNullableEnum('sicddiLevel', SICDDI_LEVELS) ?? null,
      weeklyHours: r.optionalNumber('weeklyHours', { min: 0 }) ?? 0,
      monthlyHours: r.requiredNumber('monthlyHours', { min: 0 }),
      isSicddiLocked: r.requiredBoolean('isSicddiLocked'),
      ...(r.has('notes')
        ? { notes: r.optionalString('notes', { maxLength: 1000 }) }
        : {}),
    }));
    const created = await this.service.create(actor, dto, period);
    sendSuccess(res, 201, created);
  };

  public update = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.research));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateResearchAllocationDto>(raw, (r) => ({
      id,
      ...(r.has('unitId')
        ? {
            unitId: r.optionalString('unitId', {
              allowEmpty: false,
              maxLength: 64,
            }),
          }
        : {}),
      ...(r.has('unitName')
        ? { unitName: r.optionalString('unitName', { maxLength: 160 }) }
        : {}),
      ...(r.has('documentId')
        ? {
            documentId: r.optionalString('documentId', {
              allowEmpty: false,
              maxLength: 40,
            }),
          }
        : {}),
      ...(r.has('teacherName')
        ? {
            teacherName: r.optionalString('teacherName', {
              allowEmpty: false,
              maxLength: 200,
            }),
          }
        : {}),
      ...(r.has('code')
        ? { code: r.optionalString('code', { allowEmpty: false, maxLength: 16 }) }
        : {}),
      ...(r.has('activityName')
        ? {
            activityName: r.optionalString('activityName', {
              allowEmpty: false,
              maxLength: 200,
            }),
          }
        : {}),
      ...(r.has('projectOrGroup')
        ? {
            projectOrGroup: r.optionalString('projectOrGroup', {
              allowEmpty: false,
              maxLength: 300,
            }),
          }
        : {}),
      ...(r.has('role')
        ? { role: r.optionalString('role', { allowEmpty: false, maxLength: 160 }) }
        : {}),
      ...(r.has('sicddiLevel')
        ? { sicddiLevel: r.optionalNullableEnum('sicddiLevel', SICDDI_LEVELS) }
        : {}),
      ...(r.has('weeklyHours')
        ? { weeklyHours: r.optionalNumber('weeklyHours', { min: 0 }) }
        : {}),
      ...(r.has('monthlyHours')
        ? { monthlyHours: r.optionalNumber('monthlyHours', { min: 0 }) }
        : {}),
      ...(r.has('isSicddiLocked')
        ? { isSicddiLocked: r.optionalBoolean('isSicddiLocked') }
        : {}),
      ...(r.has('notes')
        ? { notes: r.optionalString('notes', { maxLength: 1000 }) }
        : {}),
    }));
    const updated = await this.service.update(actor, dto);
    sendSuccess(res, 200, updated);
  };

  public remove = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.research));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const result = await this.service.remove(actor, id);
    sendSuccess(res, 200, result);
  };
}
