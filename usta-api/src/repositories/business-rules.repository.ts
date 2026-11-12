import type { BusinessRulesConfig } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';

/** Persistence port for period-scoped institutional payroll validation rules. */
export interface BusinessRulesRepository {
  findByPeriod(db: DbExecutor, periodCode: string): Promise<BusinessRulesConfig | undefined>;
  /** Inserts or replaces the rules of a period. */
  save(db: DbExecutor, periodCode: string, rules: BusinessRulesConfig, updatedBy: string): Promise<void>;
}
