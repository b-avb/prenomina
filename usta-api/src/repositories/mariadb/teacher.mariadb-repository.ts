import type { Selectable } from 'kysely';
import type { AssignedAcademicSpace, FacultyTeacher, TeacherCodeAllocation } from '@usta/domain';
import type { DbExecutor, TeachersTable } from '../../database/database.types.js';
import type { LockOptions, PeriodScoped } from '../../models/persistence.models.js';
import type { TeacherRepository } from '../teacher.repository.js';
import {
  toAcademicSpaceRows,
  toAllocationRows,
  toAssignedAcademicSpace,
  toFacultyTeacher,
  toTeacherCodeAllocation,
  toTeacherProfileColumns,
  toTeacherRow,
} from './mappers/teacher.mapper.js';

const INSERT_BATCH_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(key(item)) ?? [];
    group.push(item);
    groups.set(key(item), group);
  }
  return groups;
}

export class MariaDbTeacherRepository implements TeacherRepository {
  public async listByPeriod(
    db: DbExecutor,
    periodCode: string,
    filter: { unitId?: string } = {},
  ): Promise<FacultyTeacher[]> {
    let query = db.selectFrom('teachers').selectAll().where('period_code', '=', periodCode);
    if (filter.unitId) query = query.where('unit_id', '=', filter.unitId);
    const rows = await query.orderBy('insertion_order').execute();
    return this.hydrate(db, rows);
  }

  public async findById(
    db: DbExecutor,
    id: string,
    options: LockOptions = {},
  ): Promise<PeriodScoped<FacultyTeacher> | undefined> {
    let query = db.selectFrom('teachers').selectAll().where('id', '=', id);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    if (!row) return undefined;
    const [teacher] = await this.hydrate(db, [row]);
    return teacher ? { periodCode: row.period_code, entity: teacher } : undefined;
  }

  public async findByDocument(
    db: DbExecutor,
    periodCode: string,
    documentId: string,
    preferredUnitId: string,
    options: LockOptions = {},
  ): Promise<FacultyTeacher | undefined> {
    let query = db
      .selectFrom('teachers')
      .selectAll()
      .where('period_code', '=', periodCode)
      .where('document_id', '=', documentId);
    if (preferredUnitId) {
      query = query.where('unit_id', '=', preferredUnitId);
    }
    query = query.orderBy('insertion_order').limit(1);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    if (!row) return undefined;
    const [teacher] = await this.hydrate(db, [row]);
    return teacher;
  }

  public async insertMany(db: DbExecutor, periodCode: string, teachers: FacultyTeacher[]): Promise<void> {
    for (const batch of chunk(teachers, INSERT_BATCH_SIZE)) {
      await db.insertInto('teachers').values(batch.map((t) => toTeacherRow(periodCode, t))).execute();
    }
    await this.insertChildren(db, teachers);
  }

  public async save(db: DbExecutor, teacher: FacultyTeacher): Promise<void> {
    await db
      .updateTable('teachers')
      .set(toTeacherProfileColumns(teacher))
      .where('id', '=', teacher.id)
      .execute();
    await db.deleteFrom('teacher_academic_spaces').where('teacher_id', '=', teacher.id).execute();
    await db.deleteFrom('teacher_code_allocations').where('teacher_id', '=', teacher.id).execute();
    await this.insertChildren(db, [teacher]);
  }

  public async delete(db: DbExecutor, id: string): Promise<void> {
    await db.deleteFrom('teachers').where('id', '=', id).execute();
  }

  public async deleteByUnit(db: DbExecutor, periodCode: string, unitId: string): Promise<void> {
    await db
      .deleteFrom('teachers')
      .where('period_code', '=', periodCode)
      .where('unit_id', '=', unitId)
      .execute();
  }

  private async insertChildren(db: DbExecutor, teachers: FacultyTeacher[]): Promise<void> {
    for (const batch of chunk(teachers.flatMap(toAcademicSpaceRows), INSERT_BATCH_SIZE)) {
      await db.insertInto('teacher_academic_spaces').values(batch).execute();
    }
    for (const batch of chunk(teachers.flatMap(toAllocationRows), INSERT_BATCH_SIZE)) {
      await db.insertInto('teacher_code_allocations').values(batch).execute();
    }
  }

  private async hydrate(db: DbExecutor, rows: Selectable<TeachersTable>[]): Promise<FacultyTeacher[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);

    const spaceRows = await db
      .selectFrom('teacher_academic_spaces')
      .selectAll()
      .where('teacher_id', 'in', ids)
      .orderBy('insertion_order')
      .execute();
    const allocationRows = await db
      .selectFrom('teacher_code_allocations')
      .selectAll()
      .where('teacher_id', 'in', ids)
      .orderBy('code')
      .execute();

    const spacesByTeacher = groupBy(spaceRows, (row) => row.teacher_id);
    const allocationsByTeacher = groupBy(allocationRows, (row) => row.teacher_id);

    return rows.map((row) => {
      const spaces: AssignedAcademicSpace[] = (spacesByTeacher.get(row.id) ?? []).map(toAssignedAcademicSpace);
      const allocations: TeacherCodeAllocation[] = (allocationsByTeacher.get(row.id) ?? []).map(
        toTeacherCodeAllocation,
      );
      return toFacultyTeacher(row, spaces, allocations);
    });
  }
}
