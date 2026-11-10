import type { AcademicPeriod } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { PeriodRepository } from '../period.repository.js';
import { toAcademicPeriod, toAcademicPeriodRow } from './mappers/period.mapper.js';

export class MariaDbPeriodRepository implements PeriodRepository {
  public async listAll(db: DbExecutor): Promise<AcademicPeriod[]> {
    const rows = await db.selectFrom('academic_periods').selectAll().orderBy('code', 'desc').execute();
    return rows.map(toAcademicPeriod);
  }

  public async findByCode(db: DbExecutor, code: string): Promise<AcademicPeriod | undefined> {
    const row = await db
      .selectFrom('academic_periods')
      .selectAll()
      .where('code', '=', code)
      .executeTakeFirst();
    return row ? toAcademicPeriod(row) : undefined;
  }

  public async findCurrent(db: DbExecutor): Promise<AcademicPeriod | undefined> {
    const row = await db
      .selectFrom('academic_periods')
      .selectAll()
      .where('is_current', '=', 1)
      .orderBy('code', 'desc')
      .executeTakeFirst();
    return row ? toAcademicPeriod(row) : undefined;
  }

  public async insertMany(db: DbExecutor, periods: AcademicPeriod[]): Promise<void> {
    if (periods.length === 0) return;
    await db.insertInto('academic_periods').values(periods.map(toAcademicPeriodRow)).execute();
  }

  public async markCurrent(db: DbExecutor, code: string): Promise<void> {
    await db
      .updateTable('academic_periods')
      .set({ is_current: 0 })
      .where('is_current', '=', 1)
      .where('code', '<>', code)
      .execute();
    await db.updateTable('academic_periods').set({ is_current: 1 }).where('code', '=', code).execute();
  }
}
