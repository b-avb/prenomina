import {
  ValidationEngineDomain,
  WorkloadCalculatorDomain,
  type FacultyBagIndicator,
  type ValidationAlert,
} from '@usta/domain';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import { NotFoundError } from '../utils/app-error.js';
import type { PeriodContextService } from './period-context.service.js';

/** Consolidated validation report, Annex 5 bag utilization, and submission-readiness verdict for an academic unit. */
export interface UnitValidationEvaluation {
  unitId: string;
  unitName: string;
  period: string;
  totalTeachers: number;
  blockingAlertsCount: number;
  justifiableAlertsCount: number;
  infoAlertsCount: number;
  canSubmitPayroll: boolean;
  bagIndicators: FacultyBagIndicator[];
  alerts: ValidationAlert[];
}

/**
 * Evaluates domain validation alerts and Annex 5 hour-bag indicators for a faculty unit.
 */
export class ValidationEngineService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
  ) {}

  /**
   * Computes interactive editing alerts alongside stricter `enforceSubmissionReadiness` checks
   * (such as unstarted teacher workloads and unapproved Annex 3 requests) to derive `canSubmitPayroll`.
   */
  public async evaluateFacultyUnit(
    unitId: string,
    requestedPeriod?: string,
  ): Promise<UnitValidationEvaluation> {
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const [units, teachers, sacCodes, approvalRequests, rulesConfig, programQuotas] =
      await Promise.all([
        this.periodContext.hydrateUnitsForPeriod(db, periodCode),
        this.repos.teachers.listByPeriod(db, periodCode),
        this.repos.sacCodes.listAll(db),
        this.repos.approvals.listByPeriod(db, periodCode),
        this.periodContext.getRulesForPeriod(db, periodCode),
        this.repos.programs.list(db, { unitId }),
      ]);

    const unit = units.find((u) => u.id === unitId);
    if (!unit) {
      throw new NotFoundError(`La unidad académica '${unitId}' no existe.`);
    }

    const ctx = {
      units,
      teachers,
      sacCodes,
      approvalRequests,
      rulesConfig,
      programQuotas,
    };

    const alerts = ValidationEngineDomain.getUnitAlerts(unitId, ctx);
    const submissionAlerts = ValidationEngineDomain.getUnitAlerts(unitId, ctx, {
      enforceSubmissionReadiness: true,
    });

    const bagIndicators = WorkloadCalculatorDomain.computeUnitBagIndicators(
      unit,
      teachers,
      rulesConfig,
    );

    const unitTeachers = teachers.filter((t) => t.unitId === unitId);
    const unitUnstarted =
      unitTeachers.length > 0 && WorkloadCalculatorDomain.isUnitUnstarted(teachers, unitId);
    const blockingAlertsCount = alerts.filter((a) => a.severity === 'blocking').length;
    const submissionBlockingCount = submissionAlerts.filter(
      (a) => a.severity === 'blocking',
    ).length;
    const justifiableAlertsCount = alerts.filter((a) => a.severity === 'alert').length;
    const infoAlertsCount = alerts.filter((a) => a.severity === 'info').length;

    return {
      unitId: unit.id,
      unitName: unit.name,
      period: periodCode,
      totalTeachers: unitTeachers.length,
      blockingAlertsCount,
      justifiableAlertsCount,
      infoAlertsCount,
      canSubmitPayroll:
        !unitUnstarted &&
        (rulesConfig.blockSubmissionWithBlockingAlerts
          ? submissionBlockingCount === 0
          : true),
      bagIndicators,
      alerts,
    };
  }
}
