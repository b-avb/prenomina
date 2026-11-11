import type {
  ActorContext,
  BusinessRulesConfig,
  CreateSacCodeDto,
  DeletedResponse,
  ImportSacCodesDto,
  ImportSacCodesResponse,
  SacCode,
  SchedulePhase,
  SubstantiveFunction,
  UpdateRulesConfigDto,
  UpdateSacCodeDto,
  UpdateSchedulePhaseDto,
} from '@usta/domain';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

const PROTECTED_SAC_CODES = new Set(['40104', '40108']);

export class SacCatalogService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
  ) {}

  public async list(substantiveFunction?: SubstantiveFunction): Promise<SacCode[]> {
    const all = await this.repos.sacCodes.listAll(this.tx.executor);
    if (!substantiveFunction) return all;
    return all.filter((c) => c.substantiveFunction === substantiveFunction);
  }

  public async getByCode(code: string): Promise<SacCode> {
    const item = await this.repos.sacCodes.findByCode(this.tx.executor, code);
    if (!item) {
      throw new NotFoundError(`El código SAC '${code}' no existe en el catálogo ANEXO 4.`);
    }
    return item;
  }

  public async create(
    actor: ActorContext,
    dto: CreateSacCodeDto,
    requestedPeriod?: string,
  ): Promise<SacCode> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const code = dto.code.trim().toUpperCase();
      const existing = await this.repos.sacCodes.findByCode(trx, code);
      if (existing) {
        throw new ConflictError(`El código SAC '${code}' ya está registrado en el catálogo.`);
      }

      const newCode: SacCode = {
        ...dto,
        code,
        name: dto.name.trim().toUpperCase(),
        annex3Format: dto.requiresViceRectorApproval ? (dto.annex3Format ?? null) : null,
      };

      await this.repos.sacCodes.insertMany(trx, [newCode]);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: 'Catálogo Institucional SAC (ANEXO 4)',
        action: `Creación de Código SAC ${newCode.code} (${newCode.name})`,
        newValue: `${newCode.substantiveFunction} · Base: ${newCode.baseHours ?? 'S/L'}h · Tope: ${newCode.capHours ?? 'S/L'}h`,
        reason: 'Alta de código en parametrización institucional',
      });

      const persisted = await this.repos.sacCodes.findByCode(trx, code);
      return persisted ?? newCode;
    });
  }

  public async update(
    actor: ActorContext,
    dto: UpdateSacCodeDto,
    requestedPeriod?: string,
  ): Promise<SacCode> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const code = dto.code.trim();
      const existing = await this.repos.sacCodes.findByCode(trx, code);
      if (!existing) {
        throw new NotFoundError(`El código SAC '${code}' no existe.`);
      }

      const targetCode =
        dto.newCode !== undefined ? dto.newCode.trim().toUpperCase() : code;
      if (targetCode !== code) {
        if (PROTECTED_SAC_CODES.has(code)) {
          throw new BusinessRuleError(
            `El código '${code}' es estructural para el cálculo de docencia directa y PSE y no puede renombrarse.`,
          );
        }
        const collision = await this.repos.sacCodes.findByCode(trx, targetCode);
        if (collision) {
          throw new ConflictError(
            `El código SAC '${targetCode}' ya está registrado en el catálogo.`,
          );
        }
      }

      const { newCode: _ignoredNewCode, ...restDto } = dto;
      const requiresApproval =
        restDto.requiresViceRectorApproval ?? existing.requiresViceRectorApproval;
      const updated: SacCode = {
        ...existing,
        ...restDto,
        code: targetCode,
        name: restDto.name !== undefined ? restDto.name.trim().toUpperCase() : existing.name,
        annex3Format: requiresApproval
          ? restDto.annex3Format !== undefined
            ? restDto.annex3Format
            : existing.annex3Format
          : null,
      };

      await this.repos.sacCodes.update(trx, updated, code);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: 'Catálogo Institucional SAC (ANEXO 4)',
        action:
          targetCode !== code
            ? `Renombramiento y Actualización de Código SAC ${code} → ${targetCode} (${updated.name})`
            : `Actualización de Código SAC ${code} (${updated.name})`,
        previousValue: `Código: ${existing.code} · Base: ${existing.baseHours ?? 'S/L'}h · Tope: ${existing.capHours ?? 'S/L'}h · Severidad: ${existing.severity}`,
        newValue: `Código: ${updated.code} · Base: ${updated.baseHours ?? 'S/L'}h · Tope: ${updated.capHours ?? 'S/L'}h · Severidad: ${updated.severity}`,
        reason: 'Edición de parámetros normativos del código SAC',
      });

      const persisted = await this.repos.sacCodes.findByCode(trx, targetCode);
      return persisted ?? updated;
    });
  }

  public async importCatalog(
    actor: ActorContext,
    dto: ImportSacCodesDto,
    requestedPeriod?: string,
  ): Promise<ImportSacCodesResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const currentCodes = await this.repos.sacCodes.listAll(trx);
      const existingByCode = new Map<string, SacCode>(
        currentCodes.map((item) => [item.code, item]),
      );

      const toInsert: SacCode[] = [];
      let createdCount = 0;
      let updatedCount = 0;

      for (const row of dto.rows) {
        const code = row.code.trim();
        if (!code) continue;

        const existing = existingByCode.get(code);
        if (existing) {
          const updated: SacCode = {
            ...existing,
            ...(row.name ? { name: row.name.trim().toUpperCase() } : {}),
            ...(row.substantiveFunction
              ? { substantiveFunction: row.substantiveFunction }
              : {}),
            ...(row.definition ? { definition: row.definition } : {}),
            ...(row.guideline ? { guideline: row.guideline } : {}),
            ...(row.baseHours !== undefined ? { baseHours: row.baseHours } : {}),
            ...(row.capHours !== undefined ? { capHours: row.capHours } : {}),
            ...(row.postgraduateCapHours !== undefined
              ? { postgraduateCapHours: row.postgraduateCapHours }
              : {}),
            ...(row.requiresViceRectorApproval !== undefined
              ? { requiresViceRectorApproval: row.requiresViceRectorApproval }
              : {}),
            ...(row.appliesTo ? { appliesTo: row.appliesTo } : {}),
            ...(row.severity ? { severity: row.severity } : {}),
          };
          await this.repos.sacCodes.update(trx, updated);
          existingByCode.set(code, updated);
          updatedCount++;
        } else {
          const created: SacCode = {
            code,
            name: (row.name?.trim() || `TUNJA ACTIVIDAD ${code}`).toUpperCase(),
            substantiveFunction: row.substantiveFunction ?? 'Enseñanza-Aprendizaje',
            definition: row.definition || row.name || '',
            guideline: row.guideline || 'Importado desde Excel ANEXO 4',
            baseHours: row.baseHours ?? 4,
            capHours: row.capHours ?? 20,
            ...(row.postgraduateCapHours !== undefined
              ? { postgraduateCapHours: row.postgraduateCapHours }
              : {}),
            requiresViceRectorApproval: row.requiresViceRectorApproval ?? false,
            appliesTo: row.appliesTo || 'Todas las unidades académicas',
            severity: row.severity ?? 'justifiable_alert',
            facultyRules: [],
          };
          toInsert.push(created);
          existingByCode.set(code, created);
          createdCount++;
        }
      }

      if (toInsert.length > 0) {
        await this.repos.sacCodes.insertMany(trx, toInsert);
      }

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: 'Catálogo Institucional SAC (ANEXO 4)',
        action: 'Importación Masiva de Catálogo SAC (ANEXO 4)',
        newValue: `${createdCount} nuevos, ${updatedCount} actualizados`,
        reason: 'Cargue masivo transaccional desde libro Excel ANEXO 4',
      });

      const codes = await this.repos.sacCodes.listAll(trx);
      return {
        codes,
        createdCount,
        updatedCount,
      };
    });
  }

  public async remove(
    actor: ActorContext,
    code: string,
    requestedPeriod?: string,
  ): Promise<DeletedResponse> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const trimmed = code.trim();
      if (PROTECTED_SAC_CODES.has(trimmed)) {
        throw new BusinessRuleError(
          `El código '${trimmed}' es estructural para el cálculo de docencia directa y PSE y no puede eliminarse.`,
        );
      }

      const existing = await this.repos.sacCodes.findByCode(trx, trimmed);
      if (!existing) {
        throw new NotFoundError(`El código SAC '${trimmed}' no existe.`);
      }

      const inUse = await this.repos.sacCodes.isInUse(trx, trimmed);
      if (inUse) {
        throw new ConflictError(
          `El código SAC '${trimmed}' tiene horas o registros asociados y no puede eliminarse mientras esté en uso.`,
        );
      }

      await this.repos.sacCodes.delete(trx, trimmed);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: 'Catálogo Institucional SAC (ANEXO 4)',
        action: `Eliminación de Código SAC ${trimmed}`,
        previousValue: `${existing.code} — ${existing.name}`,
        newValue: 'Eliminado',
        reason: 'Baja de código del catálogo institucional',
      });

      return { deletedId: trimmed };
    });
  }

  public async getRulesConfig(requestedPeriod?: string): Promise<BusinessRulesConfig> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    return this.periodContext.getRulesForPeriod(db, periodCode);
  }

  public async updateRulesConfig(
    actor: ActorContext,
    patch: UpdateRulesConfigDto,
    requestedPeriod?: string,
  ): Promise<BusinessRulesConfig> {
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const current = await this.periodContext.getRulesForPeriod(trx, periodCode);
      const updated: BusinessRulesConfig = {
        ...current,
        ...patch,
      };

      await this.repos.businessRules.save(trx, periodCode, updated, actor.name);

      await this.audit.record(trx, actor, {
        periodCode,
        unitId: null,
        unitName: 'Reglas Institucionales de Negocio',
        action: 'Actualización de Reglas Globales del Motor de Validación',
        previousValue: JSON.stringify(current),
        newValue: JSON.stringify(updated),
        reason: 'Configuración de directrices desde panel de parametrización',
      });

      return updated;
    });
  }

  public async updateSchedulePhase(
    actor: ActorContext,
    dto: UpdateSchedulePhaseDto,
  ): Promise<SchedulePhase> {
    return this.tx.run(async (trx) => {
      const scoped = await this.repos.schedulePhases.findById(trx, dto.id);
      if (!scoped) {
        throw new NotFoundError(`La fase del cronograma '${dto.id}' no existe.`);
      }

      const existing = scoped.entity;
      const updated: SchedulePhase = {
        ...existing,
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.dateRange !== undefined ? { dateRange: dto.dateRange.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      };

      await this.repos.schedulePhases.update(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode: scoped.periodCode,
        unitId: null,
        unitName: 'Cronograma Semestral de Prenómina',
        action: `Actualización de ${updated.label}: ${updated.title}`,
        previousValue: `${existing.dateRange} (${existing.status})`,
        newValue: `${updated.dateRange} (${updated.status})`,
        reason: 'Edición del cronograma operativo de prenómina',
      });

      return updated;
    });
  }
}
