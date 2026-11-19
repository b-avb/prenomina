import { type Kysely } from 'kysely';
import type { Database } from '../database.types.js';

const ANNEX7_RESEARCH_CODES = [
  '10340',
  '13315',
  '10334',
  '10384',
  '10318',
  '10336',
  '10225',
  '10416',
  '10426',
  '10383',
] as const;

/**
 * Retires SAC code `10226` (SICDDI) and enables `locked_by_research` on the canonical
 * Annex 7 Research Directorate codes without altering existing academic periods.
 */
export async function up(db: Kysely<Database>): Promise<void> {
  await db.deleteFrom('research_allocations').where('code', '=', '10226').execute();
  await db.deleteFrom('teacher_code_allocations').where('code', '=', '10226').execute();
  await db.deleteFrom('approval_requests').where('code', '=', '10226').execute();
  await db.deleteFrom('sac_faculty_rules').where('sac_code', '=', '10226').execute();
  await db.deleteFrom('sac_codes').where('code', '=', '10226').execute();

  await db
    .updateTable('sac_codes')
    .set({ locked_by_research: 1 })
    .where('code', 'in', [...ANNEX7_RESEARCH_CODES])
    .execute();
}

export async function down(_db: Kysely<Database>): Promise<void> {
  // Data reconciliation migration; reverse schema transformations are not applicable.
}
