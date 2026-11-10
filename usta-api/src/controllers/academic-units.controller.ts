import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ChangeUnitStatusDto,
  CreateAcademicUnitDto,
  SnapshotUnitVersionDto,
  UpdateAcademicUnitDto,
  UpdateUnitDeanDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { AcademicUnitsService } from '../services/academic-units.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import { PAYROLL_STATUSES, UNIT_TYPES } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

export class AcademicUnitsController {
  constructor(
    private readonly service: AcademicUnitsService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public list = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period', req);
    const division = optionalQueryParam(url, 'division');
    const units = await this.service.list(period, division);
    sendSuccess(res, 200, units);
  };

  public getById = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const unit = await this.service.getById(id, period);
    sendSuccess(res, 200, unit);
  };

  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateAcademicUnitDto>(raw, (r) => ({
      name: r.requiredString('name', { maxLength: 160 }),
      division: r.requiredString('division', { maxLength: 160 }),
      unitType: r.requiredEnum('unitType', UNIT_TYPES),
      deanName: r.requiredString('deanName', { maxLength: 160 }),
      ...(r.has('username')
        ? { username: r.optionalString('username', { maxLength: 80 }) }
        : {}),
      ...(r.has('temporaryPassword')
        ? { temporaryPassword: r.optionalString('temporaryPassword', { maxLength: 120 }) }
        : {}),
      hasPostgraduates: r.requiredBoolean('hasPostgraduates'),
      qualityCap30411: r.requiredNumber('qualityCap30411', { min: 0 }),
      curriculumCap40106: r.requiredNumber('curriculumCap40106', { min: 0 }),
      seaCap40109: r.requiredNumber('seaCap40109', { min: 0 }),
      saberProCap40127: r.requiredNumber('saberProCap40127', { min: 0 }),
      graduatesCap20502: r.requiredNumber('graduatesCap20502', { min: 0 }),
    }));
    const created = await this.service.create(actor, dto, period);
    sendSuccess(res, 201, created);
  };

  public update = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateAcademicUnitDto>(raw, (r) => ({
      id,
      ...(r.has('name')
        ? { name: r.optionalString('name', { allowEmpty: false, maxLength: 160 }) }
        : {}),
      ...(r.has('division')
        ? {
            division: r.optionalString('division', {
              allowEmpty: false,
              maxLength: 160,
            }),
          }
        : {}),
      ...(r.has('unitType')
        ? { unitType: r.optionalEnum('unitType', UNIT_TYPES) }
        : {}),
      ...(r.has('hasPostgraduates')
        ? { hasPostgraduates: r.optionalBoolean('hasPostgraduates') }
        : {}),
      ...(r.has('qualityCap30411')
        ? { qualityCap30411: r.optionalNumber('qualityCap30411', { min: 0 }) }
        : {}),
      ...(r.has('curriculumCap40106')
        ? { curriculumCap40106: r.optionalNumber('curriculumCap40106', { min: 0 }) }
        : {}),
      ...(r.has('seaCap40109')
        ? { seaCap40109: r.optionalNumber('seaCap40109', { min: 0 }) }
        : {}),
      ...(r.has('saberProCap40127')
        ? { saberProCap40127: r.optionalNumber('saberProCap40127', { min: 0 }) }
        : {}),
      ...(r.has('graduatesCap20502')
        ? { graduatesCap20502: r.optionalNumber('graduatesCap20502', { min: 0 }) }
        : {}),
    }));
    const updated = await this.service.update(actor, dto, period);
    sendSuccess(res, 200, updated);
  };

  public updateDean = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const unitId = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateUnitDeanDto>(raw, (r) => ({
      unitId,
      deanName: r.requiredString('deanName', { maxLength: 160 }),
      ...(r.has('username')
        ? { username: r.optionalString('username', { maxLength: 80 }) }
        : {}),
      ...(r.has('temporaryPassword')
        ? { temporaryPassword: r.optionalString('temporaryPassword', { maxLength: 120 }) }
        : {}),
      ...(r.has('documentId')
        ? { documentId: r.optionalString('documentId', { maxLength: 40 }) }
        : {}),
      ...(r.has('education')
        ? { education: r.optionalString('education', { maxLength: 300 }) }
        : {}),
      ...(r.has('rank') ? { rank: r.optionalString('rank', { maxLength: 120 }) } : {}),
      ...(r.has('expectedWorkload')
        ? {
            expectedWorkload: r.optionalNumber('expectedWorkload', {
              min: 0,
              max: 300,
            }),
          }
        : {}),
    }));
    const updated = await this.service.updateDean(actor, dto, period);
    sendSuccess(res, 200, updated);
  };

  public changeStatus = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload);
    const unitId = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<ChangeUnitStatusDto>(raw, (r) => ({
      unitId,
      status: r.requiredEnum('status', PAYROLL_STATUSES),
      ...(r.has('observation')
        ? { observation: r.optionalString('observation', { maxLength: 1000 }) }
        : {}),
    }));
    const updated = await this.service.changePayrollStatus(actor, dto, period);
    sendSuccess(res, 200, updated);
  };

  public snapshotVersion = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload);
    const unitId = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const dto: SnapshotUnitVersionDto = { unitId };
    const updated = await this.service.snapshotUnitVersion(actor, dto, period);
    sendSuccess(res, 200, updated);
  };

  public remove = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const deleted = await this.service.remove(actor, id, period);
    sendSuccess(res, 200, deleted);
  };
}
