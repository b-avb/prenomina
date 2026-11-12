import {
  ValidationEngineDomain,
  type AcademicUnitSummary,
  type BusinessRulesConfig,
} from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { AcademicUnitRecord, UnitPayrollCycle } from '../models/persistence.models.js';
import type { Repositories } from '../repositories/repositories.js';
import { NotFoundError } from '../utils/app-error.js';

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  includePostgraduateInPse125: false,
  enforceAnnex6CapOnGraduates: true,
  blockSubmissionWithBlockingAlerts: true,
  minFullTimeTeachingHours: 64,
  maxRecommendedAcademicSpaces: 4,
};

/**
 * Shared read/hydration helpers for period resolution and derived `AcademicUnitSummary`
 * projections (`totalTeachers`, `pendingApprovals`, `pendingAlerts`, `payrollStatus`, `currentVersion`).
 */
export class PeriodContextService {
  constructor(private readonly repos: Repositories) {}

  public async resolvePeriod(db: DbExecutor, requestedPeriod?: string): Promise<string> {
    if (requestedPeriod) {
      const period = await this.repos.periods.findByCode(db, requestedPeriod);
      if (!period) {
        throw new NotFoundError(`El periodo académico '${requestedPeriod}' no existe.`);
      }
      return period.code;
    }
    const current = await this.repos.periods.findCurrent(db);
    if (current) return current.code;
    const all = await this.repos.periods.listAll(db);
    if (all[0]) return all[0].code;
    return '2026-2';
  }

  public async getRulesForPeriod(
    db: DbExecutor,
    periodCode: string,
  ): Promise<BusinessRulesConfig> {
    const stored = await this.repos.businessRules.findByPeriod(db, periodCode);
    return stored ?? { ...DEFAULT_BUSINESS_RULES };
  }

  public async hydrateUnitsForPeriod(
    db: DbExecutor,
    periodCode: string,
  ): Promise<AcademicUnitSummary[]> {
    const [unitRecords, cycles, teachers, approvals, sacCodes, rulesConfig, programQuotas] =
      await Promise.all([
        this.repos.units.listAll(db),
        this.repos.units.listCycles(db, periodCode),
        this.repos.teachers.listByPeriod(db, periodCode),
        this.repos.approvals.listByPeriod(db, periodCode),
        this.repos.sacCodes.listAll(db),
        this.getRulesForPeriod(db, periodCode),
        this.repos.programs.list(db),
      ]);

    const cycleByUnit = new Map<string, UnitPayrollCycle>(
      cycles.map((cycle) => [cycle.unitId, cycle]),
    );

    const preliminaryUnits: AcademicUnitSummary[] = unitRecords.map((record) =>
      this.mergeUnitWithCycle(record, cycleByUnit.get(record.id), 0, 0, 0),
    );

    return unitRecords.map((record) => {
      const cycle = cycleByUnit.get(record.id);
      const totalTeachers = teachers.filter((t) => t.unitId === record.id).length;
      const pendingApprovals = approvals.filter(
        (a) => a.unitId === record.id && a.status === 'Pendiente',
      ).length;
      const alerts = ValidationEngineDomain.getUnitAlerts(record.id, {
        units: preliminaryUnits,
        teachers,
        sacCodes,
        approvalRequests: approvals,
        rulesConfig,
        programQuotas,
      });
      const pendingAlerts = alerts.filter(
        (a) => a.severity === 'blocking' || a.severity === 'alert',
      ).length;
      return this.mergeUnitWithCycle(
        record,
        cycle,
        totalTeachers,
        pendingAlerts,
        pendingApprovals,
      );
    });
  }

  public async hydrateSingleUnit(
    db: DbExecutor,
    unitId: string,
    periodCode: string,
  ): Promise<AcademicUnitSummary> {
    const units = await this.hydrateUnitsForPeriod(db, periodCode);
    const found = units.find((u) => u.id === unitId);
    if (!found) {
      throw new NotFoundError(`La unidad académica '${unitId}' no existe.`);
    }
    return found;
  }

  private mergeUnitWithCycle(
    record: AcademicUnitRecord,
    cycle: UnitPayrollCycle | undefined,
    totalTeachers: number,
    pendingAlerts: number,
    pendingApprovals: number,
  ): AcademicUnitSummary {
    return {
      ...record,
      payrollStatus: cycle?.payrollStatus ?? 'Borrador',
      currentVersion: cycle?.currentVersion ?? 1,
      updatedAt: (cycle?.updatedAt ?? record.updatedAt).slice(0, 16).replace('T', ' '),
      totalTeachers,
      pendingAlerts,
      pendingApprovals,
    };
  }
}
