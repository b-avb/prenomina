import type { SchedulePhase } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { PeriodScoped } from '../models/persistence.models.js';

export interface SchedulePhaseRepository {
  listByPeriod(db: DbExecutor, periodCode: string): Promise<SchedulePhase[]>;
  findById(db: DbExecutor, id: string): Promise<PeriodScoped<SchedulePhase> | undefined>;
  /** Inserts phases keeping the array order as `sort_order`. */
  insertMany(db: DbExecutor, periodCode: string, phases: SchedulePhase[]): Promise<void>;
  update(db: DbExecutor, phase: SchedulePhase): Promise<void>;
}
