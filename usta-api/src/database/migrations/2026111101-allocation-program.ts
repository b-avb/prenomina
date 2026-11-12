import { sql, type Kysely } from 'kysely';

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
