import type { DbExecutor } from '../../database/database.types.js';
import type {
  AcademicUnitRecord,
  LockOptions,
  UnitPayrollCycle,
} from '../../models/persistence.models.js';
import type { AcademicUnitRepository } from '../academic-unit.repository.js';
import {
  toAcademicUnitRecord,
  toAcademicUnitRow,
  toUnitPayrollCycle,
  toUnitPayrollCycleRow,
} from './mappers/academic-unit.mapper.js';

/** MariaDB adapter for `academic_units` and period-scoped `unit_payroll_cycles`. */
export class MariaDbAcademicUnitRepository implements AcademicUnitRepository {
  public async listAll(db: DbExecutor): Promise<AcademicUnitRecord[]> {
    const rows = await db.selectFrom('academic_units').selectAll().orderBy('insertion_order').execute();
    return rows.map(toAcademicUnitRecord);
  }

  public async findById(
    db: DbExecutor,
    id: string,
    options: LockOptions = {},
  ): Promise<AcademicUnitRecord | undefined> {
    let query = db.selectFrom('academic_units').selectAll().where('id', '=', id);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toAcademicUnitRecord(row) : undefined;
  }

  public async count(db: DbExecutor): Promise<number> {
    const { total } = await db
      .selectFrom('academic_units')
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();
    return Number(total);
  }

  public async insertMany(db: DbExecutor, units: AcademicUnitRecord[]): Promise<void> {
    if (units.length === 0) return;
    await db.insertInto('academic_units').values(units.map(toAcademicUnitRow)).execute();
  }

  public async update(db: DbExecutor, unit: AcademicUnitRecord): Promise<void> {
    const { id, ...changes } = toAcademicUnitRow(unit);
    await db.updateTable('academic_units').set(changes).where('id', '=', id).execute();
  }

  public async delete(db: DbExecutor, id: string): Promise<void> {
    await db.deleteFrom('academic_units').where('id', '=', id).execute();
  }

  public async listCycles(db: DbExecutor, periodCode: string): Promise<UnitPayrollCycle[]> {
    const rows = await db
      .selectFrom('unit_payroll_cycles')
      .selectAll()
      .where('period_code', '=', periodCode)
      .execute();
    return rows.map(toUnitPayrollCycle);
  }

  public async findCycle(
    db: DbExecutor,
    unitId: string,
    periodCode: string,
  ): Promise<UnitPayrollCycle | undefined> {
    const row = await db
      .selectFrom('unit_payroll_cycles')
      .selectAll()
      .where('unit_id', '=', unitId)
      .where('period_code', '=', periodCode)
      .executeTakeFirst();
    return row ? toUnitPayrollCycle(row) : undefined;
  }

  /** Batch-upserts unit workflow cycles keyed by `(unit_id, period_code)` via `ON DUPLICATE KEY UPDATE`. */
  public async saveCycles(db: DbExecutor, cycles: UnitPayrollCycle[]): Promise<void> {
    if (cycles.length === 0) return;
    await db
      .insertInto('unit_payroll_cycles')
      .values(cycles.map(toUnitPayrollCycleRow))
      .onDuplicateKeyUpdate((eb) => ({
        payroll_status: eb.fn<UnitPayrollCycle['payrollStatus']>('VALUES', [eb.ref('payroll_status')]),
        current_version: eb.fn<number>('VALUES', [eb.ref('current_version')]),
        updated_at: eb.fn<Date>('VALUES', [eb.ref('updated_at')]),
      }))
      .execute();
  }
}
