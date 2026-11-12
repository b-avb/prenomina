import type { SacCode } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';

/** Persistence port for the institutional SAC activity catalog (Anexo 4) and faculty-specific rule overrides. */
export interface SacCodeRepository {
  listAll(db: DbExecutor): Promise<SacCode[]>;
  findByCode(db: DbExecutor, code: string): Promise<SacCode | undefined>;
  insertMany(db: DbExecutor, codes: SacCode[]): Promise<void>;
  /** Updates the code profile (including optional code rename) and replaces its faculty-specific rules. */
  update(db: DbExecutor, code: SacCode, previousCode?: string): Promise<void>;
  delete(db: DbExecutor, code: string): Promise<void>;
  /** True when teacher allocations, Annex 3 approvals, or Annex 7 research rows reference `code`. */
  isInUse(db: DbExecutor, code: string): Promise<boolean>;
}
