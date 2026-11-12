import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  CreateSacCodeDto,
  FacultySpecificRule,
  ImportSacCodesDto,
  SubstantiveFunction,
  UpdateRulesConfigDto,
  UpdateSacCodeDto,
  UpdateSchedulePhaseDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { SacCatalogService } from '../services/sac-catalog.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import {
  ANNEX3_FORMATS,
  PHASE_STATUSES,
  RULE_SEVERITIES,
  SUBSTANTIVE_FUNCTIONS,
  isOneOf,
} from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

/** Parses optional per-unit SAC hour bounds and faculty bag caps attached to a SAC code payload. */
function readFacultyRules(r: PayloadReader): FacultySpecificRule[] | undefined {
  return r.optionalObjectArray('facultyRules', (item) => ({
    unitId: item.requiredString('unitId', { maxLength: 64 }),
    unitName: item.requiredString('unitName', { maxLength: 160 }),
    minTeacherHours: item.nullableNumber('minTeacherHours', { min: 0 }),
    maxTeacherHours: item.nullableNumber('maxTeacherHours', { min: 0 }),
    ...(item.has('facultyBagCap')
      ? { facultyBagCap: item.nullableNumber('facultyBagCap', { min: 0 }) }
      : {}),
  }));
}

/**
 * HTTP handlers for the Annex 4 SAC activity catalog, faculty-specific SAC rule overrides,
 * period-scoped institutional business rules (`Acuerdo No. 48 de 2025`), and schedule phases.
 */
export class SacCatalogController {
  constructor(
    private readonly service: SacCatalogService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public list = async (
    _req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const rawFn = optionalQueryParam(url, 'substantiveFunction');
    const substantiveFunction: SubstantiveFunction | undefined = isOneOf(
      rawFn,
      SUBSTANTIVE_FUNCTIONS,
    )
      ? rawFn
      : undefined;
    const codes = await this.service.list(substantiveFunction);
    sendSuccess(res, 200, codes);
  };

  public getByCode = async (
    _req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const code = requirePathParam(params, 'code', { maxLength: 20 });
    const item = await this.service.getByCode(code);
    sendSuccess(res, 200, item);
  };

  public create = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateSacCodeDto>(raw, (r) => {
      const facultyRules = readFacultyRules(r);
      return {
        code: r.requiredString('code', { maxLength: 20 }),
        name: r.requiredString('name', { maxLength: 200 }),
        substantiveFunction: r.requiredEnum(
          'substantiveFunction',
          SUBSTANTIVE_FUNCTIONS,
        ),
        definition: r.optionalString('definition') ?? '',
        guideline: r.optionalString('guideline') ?? '',
        baseHours: r.nullableNumber('baseHours', { min: 0 }),
        capHours: r.nullableNumber('capHours', { min: 0 }),
        ...(r.has('postgraduateCapHours')
          ? {
              postgraduateCapHours: r.optionalNullableNumber('postgraduateCapHours', {
                min: 0,
              }),
            }
          : {}),
        ...(r.has('psePercentage')
          ? { psePercentage: r.optionalNullableNumber('psePercentage', { min: 0, max: 100 }) }
          : {}),
        ...(r.has('hoursPerUnitFactor')
          ? { hoursPerUnitFactor: r.optionalNullableNumber('hoursPerUnitFactor', { min: 0 }) }
          : {}),
        ...(r.has('unitLabel')
          ? { unitLabel: r.optionalNullableString('unitLabel', { maxLength: 80 }) }
          : {}),
        requiresViceRectorApproval: r.requiredBoolean('requiresViceRectorApproval'),
        ...(r.has('annex3Format')
          ? { annex3Format: r.optionalNullableEnum('annex3Format', ANNEX3_FORMATS) }
          : {}),
        appliesTo: r.optionalString('appliesTo', { maxLength: 255 }) ?? '',
        severity: r.requiredEnum('severity', RULE_SEVERITIES),
        ...(r.has('mandatoryInFaculty')
          ? { mandatoryInFaculty: r.optionalNullableBoolean('mandatoryInFaculty') }
          : {}),
        ...(r.has('lockedByResearch')
          ? { lockedByResearch: r.optionalNullableBoolean('lockedByResearch') }
          : {}),
        ...(facultyRules !== undefined ? { facultyRules } : {}),
      };
    });
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
    const code = requirePathParam(params, 'code', { maxLength: 20 });
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateSacCodeDto>(raw, (r) => {
      const facultyRules = readFacultyRules(r);
      return {
        code,
        ...(r.has('newCode')
          ? { newCode: r.optionalString('newCode', { allowEmpty: false, maxLength: 20 }) }
          : {}),
        ...(r.has('name')
          ? { name: r.optionalString('name', { allowEmpty: false, maxLength: 200 }) }
          : {}),
        ...(r.has('substantiveFunction')
          ? {
              substantiveFunction: r.optionalEnum(
                'substantiveFunction',
                SUBSTANTIVE_FUNCTIONS,
              ),
            }
          : {}),
        ...(r.has('definition')
          ? { definition: r.optionalString('definition') }
          : {}),
        ...(r.has('guideline') ? { guideline: r.optionalString('guideline') } : {}),
        ...(r.has('baseHours')
          ? { baseHours: r.optionalNullableNumber('baseHours', { min: 0 }) }
          : {}),
        ...(r.has('capHours')
          ? { capHours: r.optionalNullableNumber('capHours', { min: 0 }) }
          : {}),
        ...(r.has('postgraduateCapHours')
          ? {
              postgraduateCapHours: r.optionalNullableNumber('postgraduateCapHours', {
                min: 0,
              }),
            }
          : {}),
        ...(r.has('psePercentage')
          ? { psePercentage: r.optionalNullableNumber('psePercentage', { min: 0, max: 100 }) }
          : {}),
        ...(r.has('hoursPerUnitFactor')
          ? { hoursPerUnitFactor: r.optionalNullableNumber('hoursPerUnitFactor', { min: 0 }) }
          : {}),
        ...(r.has('unitLabel')
          ? { unitLabel: r.optionalNullableString('unitLabel', { maxLength: 80 }) }
          : {}),
        ...(r.has('requiresViceRectorApproval')
          ? {
              requiresViceRectorApproval: r.optionalBoolean(
                'requiresViceRectorApproval',
              ),
            }
          : {}),
        ...(r.has('annex3Format')
          ? { annex3Format: r.optionalNullableEnum('annex3Format', ANNEX3_FORMATS) }
          : {}),
        ...(r.has('appliesTo')
          ? { appliesTo: r.optionalString('appliesTo', { maxLength: 255 }) }
          : {}),
        ...(r.has('severity')
          ? { severity: r.optionalEnum('severity', RULE_SEVERITIES) }
          : {}),
        ...(r.has('mandatoryInFaculty')
          ? { mandatoryInFaculty: r.optionalNullableBoolean('mandatoryInFaculty') }
          : {}),
        ...(r.has('lockedByResearch')
          ? { lockedByResearch: r.optionalNullableBoolean('lockedByResearch') }
          : {}),
        ...(facultyRules !== undefined ? { facultyRules } : {}),
      };
    });
    const updated = await this.service.update(actor, dto, period);
    sendSuccess(res, 200, updated);
  };

  public importCatalog = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<ImportSacCodesDto>(raw, (r) => ({
      rows: r.objectArray('rows', (item) => ({
        code: item.requiredString('code', { maxLength: 20 }),
        ...(item.has('name')
          ? { name: item.optionalString('name', { maxLength: 200 }) }
          : {}),
        ...(item.has('substantiveFunction')
          ? {
              substantiveFunction: item.optionalEnum(
                'substantiveFunction',
                SUBSTANTIVE_FUNCTIONS,
              ),
            }
          : {}),
        ...(item.has('definition')
          ? { definition: item.optionalString('definition') }
          : {}),
        ...(item.has('guideline')
          ? { guideline: item.optionalString('guideline') }
          : {}),
        ...(item.has('baseHours')
          ? { baseHours: item.optionalNullableNumber('baseHours', { min: 0 }) }
          : {}),
        ...(item.has('capHours')
          ? { capHours: item.optionalNullableNumber('capHours', { min: 0 }) }
          : {}),
        ...(item.has('postgraduateCapHours')
          ? {
              postgraduateCapHours: item.optionalNullableNumber(
                'postgraduateCapHours',
                { min: 0 },
              ),
            }
          : {}),
        ...(item.has('requiresViceRectorApproval')
          ? {
              requiresViceRectorApproval: item.optionalBoolean(
                'requiresViceRectorApproval',
              ),
            }
          : {}),
        ...(item.has('appliesTo')
          ? { appliesTo: item.optionalString('appliesTo', { maxLength: 255 }) }
          : {}),
        ...(item.has('severity')
          ? { severity: item.optionalEnum('severity', RULE_SEVERITIES) }
          : {}),
      })),
    }));
    const result = await this.service.importCatalog(actor, dto, period);
    sendSuccess(res, 200, result);
  };

  public remove = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const code = requirePathParam(params, 'code', { maxLength: 20 });
    const period = optionalQueryParam(url, 'period', req);
    const deleted = await this.service.remove(actor, code, period);
    sendSuccess(res, 200, deleted);
  };

  public getRulesConfig = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period', req);
    const config = await this.service.getRulesConfig(period);
    sendSuccess(res, 200, config);
  };

  public updateRulesConfig = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const patch = PayloadReader.parse<UpdateRulesConfigDto>(raw, (r) => ({
      ...(r.has('includePostgraduateInPse125')
        ? {
            includePostgraduateInPse125: r.optionalBoolean(
              'includePostgraduateInPse125',
            ),
          }
        : {}),
      ...(r.has('enforceAnnex6CapOnGraduates')
        ? {
            enforceAnnex6CapOnGraduates: r.optionalBoolean(
              'enforceAnnex6CapOnGraduates',
            ),
          }
        : {}),
      ...(r.has('blockSubmissionWithBlockingAlerts')
        ? {
            blockSubmissionWithBlockingAlerts: r.optionalBoolean(
              'blockSubmissionWithBlockingAlerts',
            ),
          }
        : {}),
      ...(r.has('minFullTimeTeachingHours')
        ? {
            minFullTimeTeachingHours: r.optionalNumber('minFullTimeTeachingHours', {
              min: 0,
              max: 210,
            }),
          }
        : {}),
      ...(r.has('maxRecommendedAcademicSpaces')
        ? {
            maxRecommendedAcademicSpaces: r.optionalNumber(
              'maxRecommendedAcademicSpaces',
              { min: 1, max: 20, integer: true },
            ),
          }
        : {}),
    }));
    const updated = await this.service.updateRulesConfig(actor, patch, period);
    sendSuccess(res, 200, updated);
  };

  public updateSchedulePhase = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateSchedulePhaseDto>(raw, (r) => ({
      id,
      ...(r.has('label')
        ? { label: r.optionalString('label', { allowEmpty: false, maxLength: 64 }) }
        : {}),
      ...(r.has('title')
        ? { title: r.optionalString('title', { allowEmpty: false, maxLength: 160 }) }
        : {}),
      ...(r.has('dateRange')
        ? {
            dateRange: r.optionalString('dateRange', {
              allowEmpty: false,
              maxLength: 80,
            }),
          }
        : {}),
      ...(r.has('status')
        ? { status: r.optionalEnum('status', PHASE_STATUSES) }
        : {}),
    }));
    const updated = await this.service.updateSchedulePhase(actor, dto);
    sendSuccess(res, 200, updated);
  };
}
