import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ActorContext,
  AddAcademicSpaceDto,
  CreateTeacherDto,
  ImportTeachersDto,
  TeacherCodeAllocation,
  UpdateAcademicSpaceDto,
  UpdateCodeAllocationDto,
  UpdateTeacherDto,
} from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import type { FacultyTeachersService } from '../services/faculty-teachers.service.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import { ACADEMIC_LEVELS, TEACHER_DEDICATIONS } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

export class FacultyTeachersController {
  constructor(
    private readonly service: FacultyTeachersService,
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
    const teachers = await this.service.list(period, unitId, actor);
    sendSuccess(res, 200, teachers);
  };

  public getById = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor = resolvedActor ?? (await this.actorResolver.resolve(req));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const teacher = await this.service.getById(id, actor);
    sendSuccess(res, 200, teacher);
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
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateTeacherDto>(raw, (r) => {
      const isProvisional = r.requiredBoolean('isProvisional');
      return {
        unitId: r.requiredString('unitId', { maxLength: 64 }),
        documentId: r.requiredString('documentId', {
          allowEmpty: isProvisional,
          maxLength: 40,
        }),
        fullName: r.requiredString('fullName', { maxLength: 200 }),
        dedication: r.requiredEnum('dedication', TEACHER_DEDICATIONS),
        rank: r.optionalString('rank', { maxLength: 160 }) ?? '',
        education: r.optionalString('education', { maxLength: 300 }) ?? '',
        isProvisional,
        ...(r.has('sharedHours')
          ? { sharedHours: r.optionalNumber('sharedHours', { min: 0 }) }
          : {}),
        ...(r.has('sharedUnitName')
          ? { sharedUnitName: r.optionalString('sharedUnitName', { maxLength: 160 }) }
          : {}),
      };
    });
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
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateTeacherDto>(raw, (r) => ({
      id,
      ...(r.has('documentId')
        ? {
            documentId: r.optionalString('documentId', {
              allowEmpty: false,
              maxLength: 40,
            }),
          }
        : {}),
      ...(r.has('fullName')
        ? {
            fullName: r.optionalString('fullName', {
              allowEmpty: false,
              maxLength: 200,
            }),
          }
        : {}),
      ...(r.has('dedication')
        ? { dedication: r.optionalEnum('dedication', TEACHER_DEDICATIONS) }
        : {}),
      ...(r.has('expectedWorkload')
        ? {
            expectedWorkload: r.optionalNumber('expectedWorkload', {
              min: 0,
              max: 300,
            }),
          }
        : {}),
      ...(r.has('rank') ? { rank: r.optionalString('rank', { maxLength: 160 }) } : {}),
      ...(r.has('education')
        ? { education: r.optionalString('education', { maxLength: 300 }) }
        : {}),
      ...(r.has('isProvisional')
        ? { isProvisional: r.optionalBoolean('isProvisional') }
        : {}),
      ...(r.has('sharedHours')
        ? { sharedHours: r.optionalNumber('sharedHours', { min: 0 }) }
        : {}),
      ...(r.has('sharedUnitName')
        ? { sharedUnitName: r.optionalString('sharedUnitName', { maxLength: 160 }) }
        : {}),
      ...(r.has('generalNote')
        ? { generalNote: r.optionalString('generalNote', { maxLength: 1000 }) }
        : {}),
      ...(r.has('pseManualOverride')
        ? {
            pseManualOverride: r.optionalNullableNumber('pseManualOverride', {
              min: 0,
            }),
          }
        : {}),
    }));
    const updated = await this.service.update(actor, dto);
    sendSuccess(res, 200, updated);
  };

  public addAcademicSpace = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const teacherId = requirePathParam(params, 'teacherId', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<AddAcademicSpaceDto>(raw, (r) => ({
      teacherId,
      name: r.requiredString('name', { maxLength: 200 }),
      level: r.requiredEnum('level', ACADEMIC_LEVELS),
      hours: r.requiredNumber('hours', { min: 0, max: 300 }),
    }));
    const updated = await this.service.addAcademicSpace(actor, dto);
    sendSuccess(res, 200, updated);
  };

  public updateAcademicSpace = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const teacherId = requirePathParam(params, 'teacherId', { maxLength: 64 });
    const spaceId = requirePathParam(params, 'spaceId', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateAcademicSpaceDto>(raw, (r) => ({
      teacherId,
      spaceId,
      ...(r.has('name')
        ? { name: r.optionalString('name', { allowEmpty: false, maxLength: 200 }) }
        : {}),
      ...(r.has('level')
        ? { level: r.optionalEnum('level', ACADEMIC_LEVELS) }
        : {}),
      ...(r.has('hours')
        ? { hours: r.optionalNumber('hours', { min: 0, max: 300 }) }
        : {}),
    }));
    const updated = await this.service.updateAcademicSpace(actor, dto);
    sendSuccess(res, 200, updated);
  };

  public removeAcademicSpace = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const teacherId = requirePathParam(params, 'teacherId', { maxLength: 64 });
    const spaceId = requirePathParam(params, 'spaceId', { maxLength: 64 });
    const updated = await this.service.removeAcademicSpace(actor, teacherId, spaceId);
    sendSuccess(res, 200, updated);
  };

  public updateCodeAllocation = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const teacherId = requirePathParam(params, 'teacherId', { maxLength: 64 });
    const code = requirePathParam(params, 'code', { maxLength: 16 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<UpdateCodeAllocationDto>(raw, (r) => ({
      teacherId,
      code,
      hours: r.requiredNumber('hours', { min: 0, max: 300 }),
      ...(r.has('programId')
        ? { programId: r.optionalNullableString('programId', { maxLength: 64 }) }
        : {}),
      ...(r.has('programName')
        ? { programName: r.optionalNullableString('programName', { maxLength: 180 }) }
        : {}),
      ...(r.has('exceptionJustification')
        ? {
            exceptionJustification: r.optionalString('exceptionJustification', {
              maxLength: 1000,
            }),
          }
        : {}),
      ...(r.has('directorNote')
        ? { directorNote: r.optionalString('directorNote', { maxLength: 1000 }) }
        : {}),
    }));
    const updated = await this.service.updateCodeAllocation(actor, dto);
    sendSuccess(res, 200, updated);
  };

  public importRoster = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const unitId = requirePathParam(params, 'id', { maxLength: 64 });
    const period = optionalQueryParam(url, 'period', req);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<ImportTeachersDto>(raw, (r) => ({
      unitId,
      fileName: r.requiredString('fileName', { maxLength: 200 }),
      teachers: r.objectArray('teachers', (item) => {
        const isProvisional = item.requiredBoolean('isProvisional');
        const allocations =
          item.optionalRecord<TeacherCodeAllocation>('allocations', (alloc, key) => ({
            code: alloc.optionalString('code', { maxLength: 16 }) || key,
            hours: alloc.requiredNumber('hours', { min: 0 }),
            ...(alloc.has('programId')
              ? { programId: alloc.optionalString('programId', { maxLength: 64 }) }
              : {}),
            ...(alloc.has('programName')
              ? { programName: alloc.optionalString('programName', { maxLength: 180 }) }
              : {}),
            ...(alloc.has('version1Hours')
              ? { version1Hours: alloc.optionalNumber('version1Hours', { min: 0 }) }
              : {}),
            ...(alloc.has('unitCount')
              ? { unitCount: alloc.optionalNumber('unitCount', { min: 0 }) }
              : {}),
            ...(alloc.has('exceptionJustification')
              ? {
                  exceptionJustification: alloc.optionalString(
                    'exceptionJustification',
                    { maxLength: 1000 },
                  ),
                }
              : {}),
            ...(alloc.has('directorNote')
              ? { directorNote: alloc.optionalString('directorNote', { maxLength: 1000 }) }
              : {}),
            ...(alloc.has('adjustedByDirector')
              ? { adjustedByDirector: alloc.optionalBoolean('adjustedByDirector') }
              : {}),
          })) ?? {};

        return {
          documentId: item.requiredString('documentId', {
            allowEmpty: isProvisional,
            maxLength: 40,
          }),
          fullName: item.requiredString('fullName', { maxLength: 200 }),
          dedication: item.requiredEnum('dedication', TEACHER_DEDICATIONS),
          expectedWorkload: item.requiredNumber('expectedWorkload', { min: 0 }),
          rank: item.optionalString('rank', { maxLength: 160 }) ?? '',
          education: item.optionalString('education', { maxLength: 300 }) ?? '',
          isProvisional,
          seniorityYears: item.optionalNumber('seniorityYears', { min: 0 }) ?? 0,
          academicSpaces: item.objectArray('academicSpaces', (space) => ({
            name: space.requiredString('name', { maxLength: 200 }),
            level: space.requiredEnum('level', ACADEMIC_LEVELS),
            monthlyHours: space.requiredNumber('monthlyHours', { min: 0 }),
            ...(space.has('postgraduateModuleHours')
              ? {
                  postgraduateModuleHours: space.optionalNumber(
                    'postgraduateModuleHours',
                    { min: 0 },
                  ),
                }
              : {}),
          })),
          ...(item.has('pseManualOverride')
            ? {
                pseManualOverride: item.optionalNullableNumber('pseManualOverride', {
                  min: 0,
                }),
              }
            : {}),
          allocations,
          ...(item.has('sharedHours')
            ? { sharedHours: item.optionalNumber('sharedHours', { min: 0 }) }
            : {}),
          ...(item.has('sharedUnitName')
            ? { sharedUnitName: item.optionalString('sharedUnitName', { maxLength: 160 }) }
            : {}),
          ...(item.has('generalNote')
            ? { generalNote: item.optionalString('generalNote', { maxLength: 1000 }) }
            : {}),
          ...(item.has('version1Total')
            ? { version1Total: item.optionalNumber('version1Total', { min: 0 }) }
            : {}),
        };
      }),
    }));
    const imported = await this.service.importRoster(actor, dto, period);
    sendSuccess(res, 200, imported);
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
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.workload));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const deleted = await this.service.remove(actor, id);
    sendSuccess(res, 200, deleted);
  };
}
