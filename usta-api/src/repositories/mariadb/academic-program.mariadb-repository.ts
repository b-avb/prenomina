import type { ProgramQuotaAnnex5 } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { AcademicProgramRecord } from '../../models/persistence.models.js';
import type { AcademicProgramRepository } from '../academic-program.repository.js';
import { toAcademicProgram, toAcademicProgramRow } from './mappers/academic-program.mapper.js';

export class MariaDbAcademicProgramRepository implements AcademicProgramRepository {
  public async list(db: DbExecutor, filter: { unitId?: string } = {}): Promise<ProgramQuotaAnnex5[]> {
    let query = this.baseQuery(db);
    if (filter.unitId) query = query.where('p.unit_id', '=', filter.unitId);
    const rows = await query.orderBy('p.insertion_order').execute();
    return rows.map(toAcademicProgram);
  }

  public async findById(db: DbExecutor, id: string): Promise<ProgramQuotaAnnex5 | undefined> {
    const row = await this.baseQuery(db).where('p.id', '=', id).executeTakeFirst();
    return row ? toAcademicProgram(row) : undefined;
  }

  public async insertMany(db: DbExecutor, programs: AcademicProgramRecord[]): Promise<void> {
    if (programs.length === 0) return;
    await db.insertInto('academic_programs').values(programs.map(toAcademicProgramRow)).execute();
  }

  public async update(db: DbExecutor, program: AcademicProgramRecord): Promise<void> {
    const { id, ...changes } = toAcademicProgramRow(program);
    await db.updateTable('academic_programs').set(changes).where('id', '=', id).execute();
  }

  public async delete(db: DbExecutor, id: string): Promise<void> {
    await db.deleteFrom('academic_programs').where('id', '=', id).execute();
  }

  private baseQuery(db: DbExecutor) {
    return db
      .selectFrom('academic_programs as p')
      .innerJoin('academic_units as u', 'u.id', 'p.unit_id')
      .selectAll('p')
      .select('u.name as unit_name');
  }
}
