import type { ResearchAllocationAnnex7 } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { LockOptions } from '../../models/persistence.models.js';
import type { ResearchAllocationRepository } from '../research-allocation.repository.js';
import { toResearchAllocation, toResearchAllocationRow } from './mappers/research-allocation.mapper.js';

/** MariaDB adapter for Annex 7 `research_allocations`, joining `academic_units` for `unitName`. */
export class MariaDbResearchAllocationRepository implements ResearchAllocationRepository {
  public async listByPeriod(
    db: DbExecutor,
    periodCode: string,
    filter: { unitId?: string } = {},
  ): Promise<ResearchAllocationAnnex7[]> {
    let query = this.baseQuery(db).where('r.period_code', '=', periodCode);
    if (filter.unitId) query = query.where('r.unit_id', '=', filter.unitId);
    const rows = await query.orderBy('r.insertion_order').execute();
    return rows.map(toResearchAllocation);
  }

  public async findById(
    db: DbExecutor,
    id: string,
    options: LockOptions = {},
  ): Promise<ResearchAllocationAnnex7 | undefined> {
    let query = this.baseQuery(db).where('r.id', '=', id);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toResearchAllocation(row) : undefined;
  }

  public async insertMany(db: DbExecutor, allocations: ResearchAllocationAnnex7[]): Promise<void> {
    if (allocations.length === 0) return;
    await db.insertInto('research_allocations').values(allocations.map(toResearchAllocationRow)).execute();
  }

  public async update(db: DbExecutor, allocation: ResearchAllocationAnnex7): Promise<void> {
    const { id, ...changes } = toResearchAllocationRow(allocation);
    await db.updateTable('research_allocations').set(changes).where('id', '=', id).execute();
  }

  public async delete(db: DbExecutor, id: string): Promise<void> {
    await db.deleteFrom('research_allocations').where('id', '=', id).execute();
  }

  private baseQuery(db: DbExecutor) {
    return db
      .selectFrom('research_allocations as r')
      .innerJoin('academic_units as u', 'u.id', 'r.unit_id')
      .selectAll('r')
      .select('u.name as unit_name');
  }
}
