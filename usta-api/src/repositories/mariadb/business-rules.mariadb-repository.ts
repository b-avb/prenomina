import type { BusinessRulesConfig } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { BusinessRulesRepository } from '../business-rules.repository.js';
import { toBusinessRules, toBusinessRulesRow } from './mappers/period.mapper.js';

/** MariaDB adapter for `business_rules`, upserting period-scoped rule configurations via `ON DUPLICATE KEY UPDATE`. */
export class MariaDbBusinessRulesRepository implements BusinessRulesRepository {
  public async findByPeriod(db: DbExecutor, periodCode: string): Promise<BusinessRulesConfig | undefined> {
    const row = await db
      .selectFrom('business_rules')
      .selectAll()
      .where('period_code', '=', periodCode)
      .executeTakeFirst();
    return row ? toBusinessRules(row) : undefined;
  }

  public async save(
    db: DbExecutor,
    periodCode: string,
    rules: BusinessRulesConfig,
    updatedBy: string,
  ): Promise<void> {
    const row = toBusinessRulesRow(periodCode, rules, updatedBy);
    const { period_code: _key, ...changes } = row;
    await db.insertInto('business_rules').values(row).onDuplicateKeyUpdate(changes).execute();
  }
}
