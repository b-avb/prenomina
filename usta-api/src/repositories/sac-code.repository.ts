import type { SacCode } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';

export interface SacCodeRepository {
  listAll(db: DbExecutor): Promise<SacCode[]>;
  findByCode(db: DbExecutor, code: string): Promise<SacCode | undefined>;
  insertMany(db: DbExecutor, codes: SacCode[]): Promise<void>;
  /** Updates the code profile and replaces its faculty-specific rules. */
  update(db: DbExecutor, code: SacCode): Promise<void>;
  delete(db: DbExecutor, code: string): Promise<void>;
  /** True when teachers or research allocations reference the code. */
  isInUse(db: DbExecutor, code: string): Promise<boolean>;
}
