import {
  EXPECTED_WORKLOAD_BY_DEDICATION,
  WorkloadBalancerDomain,
  WorkloadCalculatorDomain,
  type ActorContext,
  type AddAcademicSpaceDto,
  type AssignedAcademicSpace,
  type CreateTeacherDto,
  type DeletedResponse,
  type FacultyTeacher,
  type IdGenerator,
  type ImportTeachersDto,
  type TeacherCodeAllocation,
  type UpdateAcademicSpaceDto,
  type UpdateCodeAllocationDto,
  type UpdateTeacherDto,
} from '@usta/domain';
import { assertUnitAccess, getActorAllowedUnitIds } from '../auth/actor-resolver.js';
import type { DbExecutor } from '../database/database.types.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import {
  BadRequestError,
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

export class FacultyTeachersService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  private async assertUnitEditableByActor(
    trx: DbExecutor,
    actor: ActorContext,
    unitId: string,
    periodCode: string,
  ): Promise<void> {
    if (actor.role !== 'dean') return;
    const cycle = await this.repos.units.findCycle(trx, unitId, periodCode);
    const status = cycle?.payrollStatus ?? 'Borrador';
    if (status === 'Enviada' || status === 'En Revisión' || status === 'Avalada') {
      throw new BusinessRuleError(
        `La prenómina se encuentra en estado ${status} y no permite cambios en este momento. Si aún no ha entrado en revisión, retire primero el envío para editarla.`,
      );
    }
  }

  private async hydrateResearchAllocationsOntoTeacher(
    trx: DbExecutor,
    periodCode: string,
    teacher: FacultyTeacher,
  ): Promise<boolean> {
    if (teacher.dedication === 'CATEDRA') return false;
    const unitResearch = await this.repos.research.listByPeriod(trx, periodCode, {
      unitId: teacher.unitId,
    });
    const matching = unitResearch.filter((r) => r.documentId === teacher.documentId);
    if (matching.length === 0) return false;

    const byCode = new Map<string, { hours: number; projects: string[] }>();
    for (const item of matching) {
      const curr = byCode.get(item.code) ?? { hours: 0, projects: [] };
      curr.hours += item.monthlyHours;
      if (item.projectOrGroup && !curr.projects.includes(item.projectOrGroup)) {
        curr.projects.push(item.projectOrGroup);
      }
      byCode.set(item.code, curr);
    }

    let changed = false;
    for (const [code, summary] of byCode.entries()) {
      if (summary.hours <= 0) continue;
      const prev = teacher.allocations[code];
      teacher.allocations[code] = {
        code,
        hours: summary.hours,
        ...(prev?.version1Hours !== undefined ? { version1Hours: prev.version1Hours } : {}),
        ...(prev?.exceptionJustification
          ? { exceptionJustification: prev.exceptionJustification }
          : {}),
        directorNote: `Asignado por la Dirección de Investigación (${summary.projects.join(' / ')})`,
      };
      changed = true;
    }
    return changed;
  }

  public async list(
    requestedPeriod?: string,
    unitId?: string,
    actor?: ActorContext,
  ): Promise<FacultyTeacher[]> {
    if (actor && unitId) {
      assertUnitAccess(actor, unitId);
    }
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const teachers = await this.repos.teachers.listByPeriod(
      db,
      periodCode,
      unitId ? { unitId } : undefined,
    );
    if (actor?.role === 'dean' && !unitId) {
      const allowed = new Set(getActorAllowedUnitIds(actor));
      return teachers.filter((t) => allowed.has(t.unitId));
    }
    return teachers;
  }

  public async getById(id: string, actor?: ActorContext): Promise<FacultyTeacher> {
    const scoped = await this.repos.teachers.findById(this.tx.executor, id);
    if (!scoped) {
      throw new NotFoundError('El registro docente seleccionado no existe.');
    }
    if (actor) {
      assertUnitAccess(actor, scoped.entity.unitId);
    }
    return scoped.entity;
  }

  public async create(
    actor: ActorContext,
    dto: CreateTeacherDto,
    requestedPeriod?: string,
  ): Promise<FacultyTeacher> {
    assertUnitAccess(actor, dto.unitId);
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const unitRecord = await this.repos.units.findById(trx, dto.unitId);
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }
      await this.assertUnitEditableByActor(trx, actor, dto.unitId, periodCode);

      const newTeacher = WorkloadBalancerDomain.buildNewTeacher(
        dto.unitId,
        dto,
        this.ids,
      );

      const unitTeachers = await this.repos.teachers.listByPeriod(trx, periodCode, {
        unitId: dto.unitId,
      });
      if (unitTeachers.some((t) => t.documentId === newTeacher.documentId)) {
        throw new ConflictError(
          `Ya figura un docente con documento ${newTeacher.documentId} en ${unitRecord.name}.`,
        );
      }

      await this.hydrateResearchAllocationsOntoTeacher(trx, periodCode, newTeacher);
      await this.repos.teachers.insertMany(trx, periodCode, [newTeacher]);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        teacherName: newTeacher.fullName,
        action: 'Vinculación de Docente a Prenómina (Anexo 2)',
        newValue: `${newTeacher.dedication} (${newTeacher.expectedWorkload} h/mes) · C.C. ${newTeacher.documentId}`,
        reason: newTeacher.isProvisional
          ? 'Registro de vacante o docente por convocar'
          : 'Vinculación en la planta docente de la unidad',
      });

      return newTeacher;
    });
  }

  public async update(
    actor: ActorContext,
    dto: UpdateTeacherDto,
  ): Promise<FacultyTeacher> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, dto.id, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const existing = scoped.entity;
      assertUnitAccess(actor, existing.unitId);
      await this.assertUnitEditableByActor(trx, actor, existing.unitId, scoped.periodCode);

      const nextDocId =
        dto.documentId !== undefined ? dto.documentId.trim() : existing.documentId;
      if (!nextDocId) {
        throw new BadRequestError('Ingrese el número de documento del docente.');
      }
      if (nextDocId !== existing.documentId) {
        const unitTeachers = await this.repos.teachers.listByPeriod(trx, scoped.periodCode, {
          unitId: existing.unitId,
        });
        if (unitTeachers.some((t) => t.id !== existing.id && t.documentId === nextDocId)) {
          throw new ConflictError(
            `Ya figura otro docente con documento ${nextDocId} en esta unidad académica.`,
          );
        }
      }

      const unitRecord = await this.repos.units.findById(trx, existing.unitId);
      const nextDedication = dto.dedication ?? existing.dedication;
      const nextWorkload =
        dto.expectedWorkload ??
        (dto.dedication !== undefined
          ? EXPECTED_WORKLOAD_BY_DEDICATION[dto.dedication]
          : existing.expectedWorkload);

      const updated: FacultyTeacher = {
        ...existing,
        documentId: nextDocId,
        ...(dto.fullName !== undefined
          ? { fullName: dto.fullName.trim().toUpperCase() }
          : {}),
        dedication: nextDedication,
        expectedWorkload: nextWorkload,
        ...(dto.rank !== undefined ? { rank: dto.rank.trim() } : {}),
        ...(dto.education !== undefined ? { education: dto.education.trim() } : {}),
        ...(dto.isProvisional !== undefined
          ? { isProvisional: dto.isProvisional }
          : {}),
        ...(dto.sharedHours !== undefined ? { sharedHours: dto.sharedHours } : {}),
        ...(dto.sharedUnitName !== undefined
          ? { sharedUnitName: dto.sharedUnitName.trim() }
          : {}),
        ...(dto.generalNote !== undefined ? { generalNote: dto.generalNote } : {}),
        ...(dto.pseManualOverride !== undefined
          ? { pseManualOverride: dto.pseManualOverride }
          : {}),
      };

      await this.hydrateResearchAllocationsOntoTeacher(trx, scoped.periodCode, updated);
      await this.repos.teachers.save(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: existing.unitId,
        unitName: unitRecord?.name ?? existing.unitId,
        teacherName: updated.fullName,
        action: 'Actualización de Ficha Docente',
        previousValue: `${existing.fullName} · ${existing.dedication} (${existing.expectedWorkload} h) · C.C. ${existing.documentId}`,
        newValue: `${updated.fullName} · ${updated.dedication} (${updated.expectedWorkload} h) · C.C. ${updated.documentId}`,
        reason: updated.generalNote || 'Actualización de datos del docente en Anexo 2',
      });

      return updated;
    });
  }

  public async addAcademicSpace(
    actor: ActorContext,
    dto: AddAcademicSpaceDto,
  ): Promise<FacultyTeacher> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, dto.teacherId, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      await this.assertUnitEditableByActor(trx, actor, teacher.unitId, scoped.periodCode);
      const unitRecord = await this.repos.units.findById(trx, teacher.unitId);
      const isPostgrad = dto.level === 'Posgrado';
      const monthlyHours = isPostgrad
        ? Math.round((dto.hours / 4) * 10) / 10
        : dto.hours;

      const newSpace: AssignedAcademicSpace = {
        id: this.ids.next(),
        name: dto.name.trim().toUpperCase(),
        level: dto.level,
        monthlyHours,
        ...(isPostgrad ? { postgraduateModuleHours: dto.hours } : {}),
      };

      teacher.academicSpaces.push(newSpace);
      WorkloadBalancerDomain.syncPostgraduateAllocations(teacher);

      await this.repos.teachers.save(trx, teacher);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: `Registro de Espacio Académico (${newSpace.level})`,
        newValue: `${newSpace.name} (${newSpace.monthlyHours} h/mes)`,
        reason: isPostgrad
          ? `Módulo de posgrado de ${dto.hours} h equivalente a ${monthlyHours} h/mes (código 40006)`
          : 'Asignación de espacio de pregrado (código 40104) y cálculo de PSE',
      });

      return teacher;
    });
  }

  public async updateAcademicSpace(
    actor: ActorContext,
    dto: UpdateAcademicSpaceDto,
  ): Promise<FacultyTeacher> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, dto.teacherId, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      await this.assertUnitEditableByActor(trx, actor, teacher.unitId, scoped.periodCode);
      const spaceIndex = teacher.academicSpaces.findIndex((s) => s.id === dto.spaceId);
      if (spaceIndex === -1) {
        throw new NotFoundError(
          'El espacio académico seleccionado ya no figura en la carga del docente.',
        );
      }

      const currentSpace = teacher.academicSpaces[spaceIndex]!;
      const nextLevel = dto.level ?? currentSpace.level;
      const rawInputHours =
        dto.hours ??
        (currentSpace.level === 'Posgrado' && currentSpace.postgraduateModuleHours
          ? currentSpace.postgraduateModuleHours
          : currentSpace.monthlyHours);
      const isPostgrad = nextLevel === 'Posgrado';
      const nextMonthlyHours = isPostgrad
        ? Math.round((rawInputHours / 4) * 10) / 10
        : rawInputHours;

      const updatedSpace: AssignedAcademicSpace = {
        id: currentSpace.id,
        name:
          dto.name !== undefined ? dto.name.trim().toUpperCase() : currentSpace.name,
        level: nextLevel,
        monthlyHours: nextMonthlyHours,
        ...(isPostgrad ? { postgraduateModuleHours: rawInputHours } : {}),
      };

      const wasPostgrad = currentSpace.level === 'Posgrado';
      teacher.academicSpaces[spaceIndex] = updatedSpace;
      WorkloadBalancerDomain.syncPostgraduateAllocations(teacher, {
        clearWhenNoPostgradSpaces: wasPostgrad,
      });

      await this.repos.teachers.save(trx, teacher);

      const unitRecord = await this.repos.units.findById(trx, teacher.unitId);
      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: `Edición de Espacio Académico: ${updatedSpace.name}`,
        previousValue: `${currentSpace.name} (${currentSpace.level} · ${currentSpace.monthlyHours} h/mes)`,
        newValue: `${updatedSpace.name} (${updatedSpace.level} · ${updatedSpace.monthlyHours} h/mes)`,
        reason: 'Ajuste de horas de orientación directa y actualización de PSE',
      });

      return teacher;
    });
  }

  public async removeAcademicSpace(
    actor: ActorContext,
    teacherId: string,
    spaceId: string,
  ): Promise<FacultyTeacher> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, teacherId, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      await this.assertUnitEditableByActor(trx, actor, teacher.unitId, scoped.periodCode);
      const existingSpace = teacher.academicSpaces.find((s) => s.id === spaceId);
      if (!existingSpace) {
        throw new NotFoundError(
          'El espacio académico seleccionado ya no figura en la carga del docente.',
        );
      }

      teacher.academicSpaces = teacher.academicSpaces.filter((s) => s.id !== spaceId);
      WorkloadBalancerDomain.syncPostgraduateAllocations(teacher, {
        clearWhenNoPostgradSpaces: existingSpace.level === 'Posgrado',
      });

      await this.repos.teachers.save(trx, teacher);

      const unitRecord = await this.repos.units.findById(trx, teacher.unitId);
      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: `Retiro de Espacio Académico: ${existingSpace.name}`,
        previousValue: `${existingSpace.name} (${existingSpace.monthlyHours} h/mes)`,
        newValue: '0 h/mes',
        reason: 'Retiro de espacio académico y actualización de PSE',
      });

      return teacher;
    });
  }

  public async updateCodeAllocation(
    actor: ActorContext,
    dto: UpdateCodeAllocationDto,
  ): Promise<FacultyTeacher> {
    if (dto.directorNote !== undefined && actor.role === 'dean') {
      throw new ForbiddenError(
        'Solo la Dirección de Enseñanza y Aprendizaje puede registrar notas de revisión.',
      );
    }
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, dto.teacherId, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      await this.assertUnitEditableByActor(trx, actor, teacher.unitId, scoped.periodCode);
      const [unitRecord, rulesConfig, sacDef] = await Promise.all([
        this.repos.units.findById(trx, teacher.unitId),
        this.periodContext.getRulesForPeriod(trx, scoped.periodCode),
        this.repos.sacCodes.findByCode(trx, dto.code),
      ]);

      if (dto.code === '40108') {
        const previousPse = WorkloadCalculatorDomain.getEffectivePse(
          teacher,
          rulesConfig,
        );
        const exactPse = WorkloadCalculatorDomain.computeExactPse25(
          teacher,
          rulesConfig,
        );
        teacher.pseManualOverride =
          Math.abs(dto.hours - exactPse) < 0.01 ? null : dto.hours;

        await this.repos.teachers.save(trx, teacher);

        await this.audit.record(trx, actor, {
          periodCode: scoped.periodCode,
          unitId: teacher.unitId,
          unitName: unitRecord?.name ?? teacher.unitId,
          teacherName: teacher.fullName,
          action: 'Ajuste de Horas PSE (40108)',
          previousValue: `${previousPse} h`,
          newValue: `${dto.hours} h`,
          reason:
            dto.directorNote ||
            dto.exceptionJustification ||
            'Ajuste manual de horas PSE (40108)',
        });

        return teacher;
      }

      if (!sacDef) {
        throw new NotFoundError(
          `El código SAC ${dto.code} no figura en el catálogo del Anexo 4.`,
        );
      }

      if (sacDef.lockedByResearch && actor.role === 'dean') {
        throw new ForbiddenError(
          `El código ${dto.code} (${sacDef.name}) es asignado exclusivamente por la Dirección de Investigación en el Anexo 7.`,
        );
      }

      if (
        dto.code === '10226' &&
        dto.hours > 0 &&
        ![20, 80, 136].includes(dto.hours) &&
        !dto.exceptionJustification
      ) {
        throw new BusinessRuleError(
          'El código SICDDI 10226 solo admite asignaciones de 20 h (Nivel I), 80 h (Nivel II) o 136 h (Nivel III), conforme al Acuerdo 3 del 19 de marzo de 2025.',
        );
      }

      const existing = teacher.allocations[dto.code];
      const previousHours = existing?.hours ?? 0;

      let resolvedProgramId: string | undefined =
        dto.programId === undefined ? existing?.programId : (dto.programId ?? undefined);
      let resolvedProgramName: string | undefined =
        dto.programName === undefined
          ? existing?.programName
          : (dto.programName ?? undefined);

      if (dto.programId !== undefined) {
        if (dto.programId === null) {
          resolvedProgramId = undefined;
          resolvedProgramName = undefined;
        } else {
          const matchedProg = await this.repos.programs.findById(trx, dto.programId);
          if (!matchedProg || matchedProg.unitId !== teacher.unitId) {
            throw new BadRequestError(
              `El programa académico seleccionado no pertenece a ${unitRecord?.name ?? teacher.unitId}.`,
            );
          }
          resolvedProgramId = matchedProg.id;
          resolvedProgramName = matchedProg.programName;
        }
      }

      if (dto.hours <= 0 && !dto.directorNote && !dto.exceptionJustification) {
        delete teacher.allocations[dto.code];
      } else {
        const nextAllocation: TeacherCodeAllocation = {
          code: dto.code,
          hours: Math.max(0, dto.hours),
          ...(resolvedProgramId ? { programId: resolvedProgramId } : {}),
          ...(resolvedProgramName ? { programName: resolvedProgramName } : {}),
        };
        if (existing?.version1Hours !== undefined) {
          nextAllocation.version1Hours = existing.version1Hours;
        }
        if (sacDef.hoursPerUnitFactor && sacDef.hoursPerUnitFactor > 0) {
          nextAllocation.unitCount = Math.round(
            nextAllocation.hours / sacDef.hoursPerUnitFactor,
          );
        } else if (existing?.unitCount !== undefined) {
          nextAllocation.unitCount = existing.unitCount;
        }
        const justification =
          dto.exceptionJustification !== undefined
            ? dto.exceptionJustification
            : existing?.exceptionJustification;
        if (justification) {
          nextAllocation.exceptionJustification = justification;
        }
        const note =
          dto.directorNote !== undefined ? dto.directorNote : existing?.directorNote;
        if (note) {
          nextAllocation.directorNote = note;
        }
        if (actor.role === 'director' || existing?.adjustedByDirector) {
          nextAllocation.adjustedByDirector = true;
        }
        teacher.allocations[dto.code] = nextAllocation;
      }

      await this.repos.teachers.save(trx, teacher);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: `Asignación Cód. ${dto.code} (${sacDef.name})${resolvedProgramName ? ` · ${resolvedProgramName}` : ''}`,
        previousValue: `${previousHours} h`,
        newValue: `${Math.max(0, dto.hours)} h`,
        reason:
          dto.directorNote ||
          dto.exceptionJustification ||
          `Registro en Anexo 2 por ${actor.name}`,
      });

      return teacher;
    });
  }

  public async importRoster(
    actor: ActorContext,
    dto: ImportTeachersDto,
    requestedPeriod?: string,
  ): Promise<FacultyTeacher[]> {
    assertUnitAccess(actor, dto.unitId);
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const unitRecord = await this.repos.units.findById(trx, dto.unitId, {
        forUpdate: true,
      });
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }
      await this.assertUnitEditableByActor(trx, actor, dto.unitId, periodCode);

      const [sacCodes, unitPrograms, existingUnitTeachers] = await Promise.all([
        this.repos.sacCodes.listAll(trx),
        this.repos.programs.list(trx, { unitId: dto.unitId }),
        this.repos.teachers.listByPeriod(trx, periodCode, { unitId: dto.unitId }),
      ]);
      const sacByCode = new Map(sacCodes.map((c) => [c.code, c]));
      const programById = new Map(unitPrograms.map((p) => [p.id, p]));
      const existingByDoc = new Map(existingUnitTeachers.map((t) => [t.documentId, t]));

      const seenDocs = new Set<string>();
      const preparedTeachers: { entity: FacultyTeacher; isExisting: boolean }[] = [];

      for (let index = 0; index < dto.teachers.length; index++) {
        const row = dto.teachers[index]!;
        const rawDoc = row.documentId.trim();
        if (!rawDoc && !row.isProvisional) {
          throw new BadRequestError(
            `Fila ${index + 1} (${row.fullName}): indique el documento de identidad del docente.`,
          );
        }
        const documentId =
          rawDoc || `VACANTE-${this.ids.next().slice(0, 8).toUpperCase()}`;
        if (seenDocs.has(documentId)) {
          throw new BadRequestError(
            `El archivo incluye documentos de identidad repetidos en la misma unidad (${documentId}).`,
          );
        }
        seenDocs.add(documentId);

        const matchedExisting = existingByDoc.get(documentId);
        const teacherId = matchedExisting ? matchedExisting.id : this.ids.next();

        const sanitizedAllocations: Record<string, TeacherCodeAllocation> = {};
        for (const [code, alloc] of Object.entries(row.allocations ?? {})) {
          if (code === '40104' || code === '40108') continue;
          const sacDef = sacByCode.get(code);
          if (!sacDef && code !== '40006') {
            throw new BadRequestError(
              `El código SAC ${code} asociado a ${row.fullName} no figura en el catálogo del Anexo 4.`,
            );
          }
          if (sacDef?.lockedByResearch && actor.role === 'dean') {
            // Preserve existing research allocation if present instead of allowing Excel overwrite by Dean
            const prevResearch = matchedExisting?.allocations[code];
            if (prevResearch) {
              sanitizedAllocations[code] = prevResearch;
            }
            continue;
          }
          let resolvedProgramId = alloc.programId;
          let resolvedProgramName = alloc.programName;
          if (alloc.programId) {
            const prog = programById.get(alloc.programId);
            if (!prog) {
              throw new BadRequestError(
                `El programa asociado en el archivo no pertenece a ${unitRecord.name}.`,
              );
            }
            resolvedProgramId = prog.id;
            resolvedProgramName = prog.programName;
          }
          const prevAlloc = matchedExisting?.allocations[code];
          sanitizedAllocations[code] = {
            ...alloc,
            code,
            hours: Math.max(0, alloc.hours),
            ...(resolvedProgramId ? { programId: resolvedProgramId } : {}),
            ...(resolvedProgramName ? { programName: resolvedProgramName } : {}),
            ...(prevAlloc?.version1Hours !== undefined
              ? { version1Hours: prevAlloc.version1Hours }
              : {}),
          };
        }

        const entity: FacultyTeacher = {
          ...row,
          id: teacherId,
          unitId: dto.unitId,
          documentId,
          fullName: row.fullName.trim().toUpperCase(),
          ...(matchedExisting?.version1Total !== undefined
            ? { version1Total: matchedExisting.version1Total }
            : {}),
          academicSpaces: row.academicSpaces.map((space) => {
            const isPostgrad = space.level === 'Posgrado';
            const rawHours =
              isPostgrad && space.postgraduateModuleHours
                ? space.postgraduateModuleHours
                : space.monthlyHours;
            return {
              ...space,
              id: this.ids.next(),
              name: space.name.trim().toUpperCase(),
              monthlyHours: isPostgrad
                ? space.postgraduateModuleHours
                  ? Math.round((rawHours / 4) * 10) / 10
                  : space.monthlyHours
                : space.monthlyHours,
            };
          }),
          allocations: sanitizedAllocations,
        };

        WorkloadBalancerDomain.syncPostgraduateAllocations(entity);
        await this.hydrateResearchAllocationsOntoTeacher(trx, periodCode, entity);
        preparedTeachers.push({ entity, isExisting: Boolean(matchedExisting) });
      }

      const keptIds = new Set(preparedTeachers.map((p) => p.entity.id));
      for (const oldTeacher of existingUnitTeachers) {
        if (!keptIds.has(oldTeacher.id)) {
          await this.repos.teachers.delete(trx, oldTeacher.id);
        }
      }

      const toInsert: FacultyTeacher[] = [];
      for (const item of preparedTeachers) {
        if (item.isExisting) {
          await this.repos.teachers.save(trx, item.entity);
        } else {
          toInsert.push(item.entity);
        }
      }
      if (toInsert.length > 0) {
        await this.repos.teachers.insertMany(trx, periodCode, toInsert);
      }

      const teachers = preparedTeachers.map((p) => p.entity);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        action: `Importación de Planta Docente desde Excel (${dto.fileName})`,
        newValue: `${teachers.length} docentes actualizados en ${unitRecord.name}`,
        reason: `Cargue de Anexo 2 realizado por ${actor.name}`,
      });

      return teachers;
    });
  }

  public async remove(
    actor: ActorContext,
    id: string,
  ): Promise<DeletedResponse> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, id, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError('El registro docente seleccionado no existe.');
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      await this.assertUnitEditableByActor(trx, actor, teacher.unitId, scoped.periodCode);
      const unitRecord = await this.repos.units.findById(trx, teacher.unitId);

      await this.repos.teachers.delete(trx, id);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: 'Retiro de docente en prenómina',
        previousValue: `${teacher.fullName} (C.C. ${teacher.documentId} · ${teacher.dedication})`,
        newValue: 'Retirado',
        reason: 'Retiro de registro docente en Anexo 2',
      });

      return { deletedId: id };
    });
  }
}
