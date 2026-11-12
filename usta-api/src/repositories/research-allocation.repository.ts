import type { ResearchAllocationAnnex7 } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { LockOptions } from '../models/persistence.models.js';

/** Persistence port for Annex 7 research hour allocations managed by Dirección de Investigación. */
export interface ResearchAllocationRepository {
  listByPeriod(db: DbExecutor, periodCode: string, filter?: { unitId?: string }): Promise<ResearchAllocationAnnex7[]>;
  findById(db: DbExecutor, id: string, options?: LockOptions): Promise<ResearchAllocationAnnex7 | undefined>;
  insertMany(db: DbExecutor, allocations: ResearchAllocationAnnex7[]): Promise<void>;
  update(db: DbExecutor, allocation: ResearchAllocationAnnex7): Promise<void>;
  delete(db: DbExecutor, id: string): Promise<void>;
}
