import type { BusinessRulesConfig } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';

export interface BusinessRulesRepository {
  findByPeriod(db: DbExecutor, periodCode: string): Promise<BusinessRulesConfig | undefined>;
  /** Inserts or replaces the rules of a period. */
  save(db: DbExecutor, periodCode: string, rules: BusinessRulesConfig, updatedBy: string): Promise<void>;
}
