import { sql, type Kysely } from 'kysely';

/**
 * Adds optional `program_id` and `program_name` columns to `teacher_code_allocations`
 * so Annex 5 coordination/tutoring SAC hours (`30411`, `40106`, `40109`, `40127`) can be
 * attributed to a specific academic program. Guards DDL with `INFORMATION_SCHEMA` checks
 * for idempotency across pre-patched environments.
 */
async function hasColumn(db: Kysely<unknown>, columnName: string): Promise<boolean> {
  const res = await sql<{ cnt: number }>`
    SELECT COUNT(*) AS cnt
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'teacher_code_allocations'
      AND COLUMN_NAME = ${columnName}
  `.execute(db);
  return Number(res.rows[0]?.cnt ?? 0) > 0;
}

export async function up(db: Kysely<unknown>): Promise<void> {
  if (!(await hasColumn(db, 'program_id'))) {
    await sql`ALTER TABLE teacher_code_allocations
      ADD COLUMN program_id VARCHAR(64) NULL AFTER hours`.execute(db);
  }
  if (!(await hasColumn(db, 'program_name'))) {
    await sql`ALTER TABLE teacher_code_allocations
      ADD COLUMN program_name VARCHAR(180) NULL AFTER program_id`.execute(db);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  if (await hasColumn(db, 'program_name')) {
    await sql`ALTER TABLE teacher_code_allocations
      DROP COLUMN program_name`.execute(db);
  }
  if (await hasColumn(db, 'program_id')) {
    await sql`ALTER TABLE teacher_code_allocations
      DROP COLUMN program_id`.execute(db);
  }
}
