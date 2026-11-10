import type { AcademicPeriod } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';

export interface PeriodRepository {
  listAll(db: DbExecutor): Promise<AcademicPeriod[]>;
  findByCode(db: DbExecutor, code: string): Promise<AcademicPeriod | undefined>;
  findCurrent(db: DbExecutor): Promise<AcademicPeriod | undefined>;
  insertMany(db: DbExecutor, periods: AcademicPeriod[]): Promise<void>;
  /** Flags `code` as the only current period. */
  markCurrent(db: DbExecutor, code: string): Promise<void>;
}
