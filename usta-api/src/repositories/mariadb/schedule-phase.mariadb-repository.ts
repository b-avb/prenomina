import type { SchedulePhase } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { PeriodScoped } from '../../models/persistence.models.js';
import type { SchedulePhaseRepository } from '../schedule-phase.repository.js';
import { toSchedulePhase, toSchedulePhaseRow } from './mappers/period.mapper.js';

/** MariaDB adapter for `schedule_phases`, preserving phase sequence via `sort_order`. */
export class MariaDbSchedulePhaseRepository implements SchedulePhaseRepository {
  public async listByPeriod(db: DbExecutor, periodCode: string): Promise<SchedulePhase[]> {
    const rows = await db
      .selectFrom('schedule_phases')
      .selectAll()
      .where('period_code', '=', periodCode)
      .orderBy('sort_order')
      .execute();
    return rows.map(toSchedulePhase);
  }

  public async findById(db: DbExecutor, id: string): Promise<PeriodScoped<SchedulePhase> | undefined> {
    const row = await db.selectFrom('schedule_phases').selectAll().where('id', '=', id).executeTakeFirst();
    return row ? { periodCode: row.period_code, entity: toSchedulePhase(row) } : undefined;
  }

  public async insertMany(db: DbExecutor, periodCode: string, phases: SchedulePhase[]): Promise<void> {
    if (phases.length === 0) return;
    await db
      .insertInto('schedule_phases')
      .values(phases.map((phase, index) => toSchedulePhaseRow(periodCode, phase, index)))
      .execute();
  }

  public async update(db: DbExecutor, phase: SchedulePhase): Promise<void> {
    await db
      .updateTable('schedule_phases')
      .set({ label: phase.label, title: phase.title, date_range: phase.dateRange, status: phase.status })
      .where('id', '=', phase.id)
      .execute();
  }
}
