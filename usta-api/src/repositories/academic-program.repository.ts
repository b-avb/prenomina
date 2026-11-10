import type { ProgramQuotaAnnex5 } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { AcademicProgramRecord } from '../models/persistence.models.js';

export interface AcademicProgramRepository {
  list(db: DbExecutor, filter?: { unitId?: string }): Promise<ProgramQuotaAnnex5[]>;
  findById(db: DbExecutor, id: string): Promise<ProgramQuotaAnnex5 | undefined>;
  insertMany(db: DbExecutor, programs: AcademicProgramRecord[]): Promise<void>;
  update(db: DbExecutor, program: AcademicProgramRecord): Promise<void>;
  delete(db: DbExecutor, id: string): Promise<void>;
}
