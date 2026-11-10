import type { FacultyTeacher } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { LockOptions, PeriodScoped } from '../models/persistence.models.js';

/**
 * Teacher aggregate repository: a teacher row plus its academic spaces and code
 * allocations, always loaded and persisted as one unit.
 */
export interface TeacherRepository {
  listByPeriod(db: DbExecutor, periodCode: string, filter?: { unitId?: string }): Promise<FacultyTeacher[]>;
  findById(db: DbExecutor, id: string, options?: LockOptions): Promise<PeriodScoped<FacultyTeacher> | undefined>;
  /** Finds the teacher of a period by document id, preferring the given unit. */
  findByDocument(
    db: DbExecutor,
    periodCode: string,
    documentId: string,
    preferredUnitId: string,
    options?: LockOptions,
  ): Promise<FacultyTeacher | undefined>;
  insertMany(db: DbExecutor, periodCode: string, teachers: FacultyTeacher[]): Promise<void>;
  /** Persists profile fields and replaces academic spaces and allocations. */
  save(db: DbExecutor, teacher: FacultyTeacher): Promise<void>;
  delete(db: DbExecutor, id: string): Promise<void>;
  deleteByUnit(db: DbExecutor, periodCode: string, unitId: string): Promise<void>;
}
