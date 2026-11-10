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
import type { TransactionRunner } from '../database/transaction-runner.js';
import { assertUnitAccess } from '../auth/actor-resolver.js';
import type { Repositories } from '../repositories/repositories.js';
import {
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

  public async list(
    requestedPeriod?: string,
    unitId?: string,
  ): Promise<FacultyTeacher[]> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.repos.teachers.listByPeriod(
      db,
      periodCode,
      unitId ? { unitId } : undefined,
    );
  }

  public async getById(id: string): Promise<FacultyTeacher> {
    const scoped = await this.repos.teachers.findById(this.tx.executor, id);
    if (!scoped) {
      throw new NotFoundError(`El docente '${id}' no existe.`);
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
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
      }

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
          `Ya existe un docente con documento '${newTeacher.documentId}' en ${unitRecord.name}.`,
        );
      }

      await this.repos.teachers.insertMany(trx, periodCode, [newTeacher]);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        teacherName: newTeacher.fullName,
        action: 'Vinculación de Docente a Prenómina (ANEXO 2)',
        newValue: `${newTeacher.dedication} (${newTeacher.expectedWorkload} h/mes) · C.C. ${newTeacher.documentId}`,
        reason: newTeacher.isProvisional
          ? 'Alta de vacante / docente provisional'
          : 'Alta de docente en planta de unidad académica',
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
        throw new NotFoundError(`El docente '${dto.id}' no existe.`);
      }

      const existing = scoped.entity;
      assertUnitAccess(actor, existing.unitId);
      const unitRecord = await this.repos.units.findById(trx, existing.unitId);
      const nextDedication = dto.dedication ?? existing.dedication;
      const nextWorkload =
        dto.expectedWorkload ??
        (dto.dedication !== undefined
          ? EXPECTED_WORKLOAD_BY_DEDICATION[dto.dedication]
          : existing.expectedWorkload);

      const updated: FacultyTeacher = {
        ...existing,
        ...(dto.documentId !== undefined ? { documentId: dto.documentId.trim() } : {}),
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

      await this.repos.teachers.save(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: existing.unitId,
        unitName: unitRecord?.name ?? existing.unitId,
        teacherName: updated.fullName,
        action: 'Actualización de Ficha Docente',
        previousValue: `${existing.fullName} · ${existing.dedication} (${existing.expectedWorkload}h) · C.C. ${existing.documentId}`,
        newValue: `${updated.fullName} · ${updated.dedication} (${updated.expectedWorkload}h) · C.C. ${updated.documentId}`,
        reason: updated.generalNote || 'Actualización de perfil docente en matriz ANEXO 2',
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
        throw new NotFoundError(`El docente '${dto.teacherId}' no existe.`);
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
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
        action: `Adición de Espacio Académico (${newSpace.level})`,
        newValue: `${newSpace.name} (${newSpace.monthlyHours} h/mes)`,
        reason: isPostgrad
          ? `Módulo de posgrado de ${dto.hours} h ÷ 4 = ${monthlyHours} h/mes (Cód. 40006)`
          : 'Asignación de espacio de pregrado (Cód. 40104) y recálculo automático de PSE',
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
        throw new NotFoundError(`El docente '${dto.teacherId}' no existe.`);
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      const spaceIndex = teacher.academicSpaces.findIndex((s) => s.id === dto.spaceId);
      if (spaceIndex === -1) {
        throw new NotFoundError(
          `El espacio académico '${dto.spaceId}' no existe en la carga del docente.`,
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

      teacher.academicSpaces[spaceIndex] = updatedSpace;
      WorkloadBalancerDomain.syncPostgraduateAllocations(teacher);

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
        reason: 'Ajuste de horas de docencia directa y sincronización de PSE',
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
        throw new NotFoundError(`El docente '${teacherId}' no existe.`);
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      const existingSpace = teacher.academicSpaces.find((s) => s.id === spaceId);
      if (!existingSpace) {
        throw new NotFoundError(
          `El espacio académico '${spaceId}' no existe en la carga del docente.`,
        );
      }

      teacher.academicSpaces = teacher.academicSpaces.filter((s) => s.id !== spaceId);
      WorkloadBalancerDomain.syncPostgraduateAllocations(teacher);

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
        reason: 'Eliminación de espacio académico y recálculo automático de PSE',
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
        'Solo la Dirección de Enseñanza y Aprendizaje puede registrar notas de revisión de Dirección.',
      );
    }
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.teachers.findById(trx, dto.teacherId, {
        forUpdate: true,
      });
      if (!scoped) {
        throw new NotFoundError(`El docente '${dto.teacherId}' no existe.`);
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
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
            'Ajuste directo de Preparación, Seguimiento y Evaluación (PSE)',
        });

        return teacher;
      }

      if (!sacDef) {
        throw new NotFoundError(
          `El código SAC '${dto.code}' no existe en el catálogo ANEXO 4.`,
        );
      }

      if (
        dto.code === '10226' &&
        dto.hours > 0 &&
        ![20, 80, 136].includes(dto.hours) &&
        !dto.exceptionJustification
      ) {
        throw new BusinessRuleError(
          'El código SICDDI 10226 solo permite asignaciones de 20 h (Nivel I), 80 h (Nivel II) o 136 h (Nivel III) según el Acuerdo 3 del 19/03/2025.',
        );
      }

      const existing = teacher.allocations[dto.code];
      const previousHours = existing?.hours ?? 0;

      if (dto.hours <= 0 && !dto.directorNote && !dto.exceptionJustification) {
        delete teacher.allocations[dto.code];
      } else {
        const nextAllocation: TeacherCodeAllocation = {
          code: dto.code,
          hours: Math.max(0, dto.hours),
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
        action: `Asignación Cód. ${dto.code} (${sacDef.name})`,
        previousValue: `${previousHours} h`,
        newValue: `${Math.max(0, dto.hours)} h`,
        reason:
          dto.directorNote ||
          dto.exceptionJustification ||
          `Registro en matriz ANEXO 2 por ${actor.name}`,
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
        throw new NotFoundError(`La unidad académica '${dto.unitId}' no existe.`);
      }

      const seenDocs = new Set<string>();
      const teachers: FacultyTeacher[] = dto.teachers.map((row, index) => {
        const id = this.ids.next();
        let documentId = row.documentId.trim() || `IMP-${index + 1}`;
        if (seenDocs.has(documentId)) {
          documentId = `${documentId}-${index + 1}`;
        }
        seenDocs.add(documentId);

        return {
          ...row,
          id,
          unitId: dto.unitId,
          documentId,
          fullName: row.fullName.trim().toUpperCase(),
          academicSpaces: row.academicSpaces.map((space) => ({
            ...space,
            id: this.ids.next(),
            name: space.name.trim().toUpperCase(),
          })),
        };
      });

      await this.repos.teachers.deleteByUnit(trx, periodCode, dto.unitId);
      await this.repos.teachers.insertMany(trx, periodCode, teachers);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: unitRecord.id,
        unitName: unitRecord.name,
        action: `Importación de Planta Docente desde Excel (${dto.fileName})`,
        newValue: `${teachers.length} docentes cargados en ${unitRecord.name}`,
        reason: `Cargue masivo ANEXO 2 ejecutado por ${actor.name}`,
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
        throw new NotFoundError(`El docente '${id}' no existe.`);
      }

      const teacher = scoped.entity;
      assertUnitAccess(actor, teacher.unitId);
      const unitRecord = await this.repos.units.findById(trx, teacher.unitId);

      await this.repos.teachers.delete(trx, id);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: teacher.unitId,
        unitName: unitRecord?.name ?? teacher.unitId,
        teacherName: teacher.fullName,
        action: 'Retiro de Docente de Prenómina',
        previousValue: `${teacher.fullName} (C.C. ${teacher.documentId} · ${teacher.dedication})`,
        newValue: 'Eliminado',
        reason: 'Retiro de registro docente en matriz ANEXO 2',
      });

      return { deletedId: id };
    });
  }
}
