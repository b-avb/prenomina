import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  CreateAcademicProgramDto,
  UpdateAcademicProgramDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { AcademicProgramsService } from '../services/academic-programs.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import { ACADEMIC_LEVELS, PROGRAM_MODALITIES } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

/**
 * HTTP handlers for Academic Programs and Annex 5 coordination/tutoring quotas (`30411`, `40106`, `40109`, `40127`).
 * Read access is available to all authenticated users; mutations require institutional `management` roles.
 */
export class AcademicProgramsController {
  constructor(
    private readonly service: AcademicProgramsService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public list = async (
    _req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const unitId = optionalQueryParam(url, 'unitId');
    const programs = await this.service.list(unitId);
    sendSuccess(res, 200, programs);
  };

  /** Creates an academic program and synchronizes its parent unit's Annex 5 aggregate caps. */
  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateAcademicProgramDto>(raw, (r) => ({
      unitId: r.requiredString('unitId', { maxLength: 64 }),
      programName: r.requiredString('programName', { maxLength: 200 }),
      level: r.requiredEnum('level', ACADEMIC_LEVELS),
      modality: r.requiredEnum('modality', PROGRAM_MODALITIES),
      accreditationStatus: r.requiredString('accreditationStatus', { maxLength: 160 }),
      quality30411: r.requiredNumber('quality30411', { min: 0 }),
      ...(r.has('qualityNotes')
        ? { qualityNotes: r.optionalString('qualityNotes', { maxLength: 500 }) }
        : {}),
      curriculum40106: r.requiredNumber('curriculum40106', { min: 0 }),
      ...(r.has('curriculumNotes')
        ? { curriculumNotes: r.optionalString('curriculumNotes', { maxLength: 500 }) }
        : {}),
      sea40109: r.requiredNumber('sea40109', { min: 0 }),
      saberPro40127: r.requiredNumber('saberPro40127', { min: 0 }),
      isActive: r.requiredBoolean('isActive'),
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
    const dto = PayloadReader.parse<UpdateAcademicProgramDto>(raw, (r) => ({
      id,
      ...(r.has('programName')
        ? {
            programName: r.optionalString('programName', {
              allowEmpty: false,
              maxLength: 200,
            }),
          }
        : {}),
      ...(r.has('level') ? { level: r.optionalEnum('level', ACADEMIC_LEVELS) } : {}),
      ...(r.has('modality')
        ? { modality: r.optionalEnum('modality', PROGRAM_MODALITIES) }
        : {}),
      ...(r.has('accreditationStatus')
        ? {
            accreditationStatus: r.optionalString('accreditationStatus', {
              allowEmpty: false,
              maxLength: 160,
            }),
          }
        : {}),
      ...(r.has('quality30411')
        ? { quality30411: r.optionalNumber('quality30411', { min: 0 }) }
        : {}),
      ...(r.has('qualityNotes')
        ? { qualityNotes: r.optionalString('qualityNotes', { maxLength: 500 }) }
        : {}),
      ...(r.has('curriculum40106')
        ? { curriculum40106: r.optionalNumber('curriculum40106', { min: 0 }) }
        : {}),
      ...(r.has('curriculumNotes')
        ? { curriculumNotes: r.optionalString('curriculumNotes', { maxLength: 500 }) }
        : {}),
      ...(r.has('sea40109')
        ? { sea40109: r.optionalNumber('sea40109', { min: 0 }) }
        : {}),
      ...(r.has('saberPro40127')
        ? { saberPro40127: r.optionalNumber('saberPro40127', { min: 0 }) }
        : {}),
      ...(r.has('isActive') ? { isActive: r.optionalBoolean('isActive') } : {}),
    }));
    const updated = await this.service.update(actor, dto, period);
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
    const result = await this.service.remove(actor, id, period);
    sendSuccess(res, 200, result);
  };
}
