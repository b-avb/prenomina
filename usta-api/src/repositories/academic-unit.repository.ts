import type { DbExecutor } from '../database/database.types.js';
import type {
  AcademicUnitRecord,
  LockOptions,
  UnitPayrollCycle,
} from '../models/persistence.models.js';

/** Academic unit aggregate: the global unit profile plus its per-period payroll cycles. */
export interface AcademicUnitRepository {
  listAll(db: DbExecutor): Promise<AcademicUnitRecord[]>;
  findById(db: DbExecutor, id: string, options?: LockOptions): Promise<AcademicUnitRecord | undefined>;
  count(db: DbExecutor): Promise<number>;
  insertMany(db: DbExecutor, units: AcademicUnitRecord[]): Promise<void>;
  update(db: DbExecutor, unit: AcademicUnitRecord): Promise<void>;
  delete(db: DbExecutor, id: string): Promise<void>;

  listCycles(db: DbExecutor, periodCode: string): Promise<UnitPayrollCycle[]>;
  findCycle(db: DbExecutor, unitId: string, periodCode: string): Promise<UnitPayrollCycle | undefined>;
  /** Inserts or updates the cycles (keyed by unit + period). */
  saveCycles(db: DbExecutor, cycles: UnitPayrollCycle[]): Promise<void>;
}
