import type { FacultySpecificRule, SacCode } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { SacCodeRepository } from '../sac-code.repository.js';
import {
  toFacultySpecificRule,
  toSacCode,
  toSacCodeRow,
  toSacFacultyRuleRows,
} from './mappers/sac-code.mapper.js';

export class MariaDbSacCodeRepository implements SacCodeRepository {
  public async listAll(db: DbExecutor): Promise<SacCode[]> {
    const rows = await db.selectFrom('sac_codes').selectAll().orderBy('insertion_order').execute();
    const rulesByCode = await this.loadFacultyRules(db);
    return rows.map((row) => toSacCode(row, rulesByCode.get(row.code) ?? []));
  }

  public async findByCode(db: DbExecutor, code: string): Promise<SacCode | undefined> {
    const row = await db.selectFrom('sac_codes').selectAll().where('code', '=', code).executeTakeFirst();
    if (!row) return undefined;
    const rulesByCode = await this.loadFacultyRules(db, code);
    return toSacCode(row, rulesByCode.get(code) ?? []);
  }

  public async insertMany(db: DbExecutor, codes: SacCode[]): Promise<void> {
    if (codes.length === 0) return;
    await db.insertInto('sac_codes').values(codes.map(toSacCodeRow)).execute();
    await this.insertFacultyRules(db, codes);
  }

  public async update(db: DbExecutor, code: SacCode, previousCode?: string): Promise<void> {
    const targetKey = previousCode ?? code.code;
    const row = toSacCodeRow(code);
    if (previousCode && previousCode !== code.code) {
      await db.updateTable('sac_codes').set(row).where('code', '=', targetKey).execute();
    } else {
      const { code: _key, ...changes } = row;
      await db.updateTable('sac_codes').set(changes).where('code', '=', targetKey).execute();
    }
    await db.deleteFrom('sac_faculty_rules').where('sac_code', '=', code.code).execute();
    await this.insertFacultyRules(db, [code]);
  }

  public async delete(db: DbExecutor, code: string): Promise<void> {
    await db.deleteFrom('sac_codes').where('code', '=', code).execute();
  }

  public async isInUse(db: DbExecutor, code: string): Promise<boolean> {
    const allocation = await db
      .selectFrom('teacher_code_allocations')
      .select('code')
      .where('code', '=', code)
      .limit(1)
      .executeTakeFirst();
    if (allocation) return true;
    const research = await db
      .selectFrom('research_allocations')
      .select('code')
      .where('code', '=', code)
      .limit(1)
      .executeTakeFirst();
    return research !== undefined;
  }

  private async insertFacultyRules(db: DbExecutor, codes: SacCode[]): Promise<void> {
    const rows = codes.flatMap(toSacFacultyRuleRows);
    if (rows.length === 0) return;
    await db.insertInto('sac_faculty_rules').values(rows).execute();
  }

  private async loadFacultyRules(db: DbExecutor, code?: string): Promise<Map<string, FacultySpecificRule[]>> {
    let query = db
      .selectFrom('sac_faculty_rules as r')
      .innerJoin('academic_units as u', 'u.id', 'r.unit_id')
      .selectAll('r')
      .select('u.name as unit_name');
    if (code) query = query.where('r.sac_code', '=', code);
    const rows = await query.orderBy('r.sac_code').orderBy('r.sort_order').execute();

    const rulesByCode = new Map<string, FacultySpecificRule[]>();
    for (const row of rows) {
      const rules = rulesByCode.get(row.sac_code) ?? [];
      rules.push(toFacultySpecificRule(row));
      rulesByCode.set(row.sac_code, rules);
    }
    return rulesByCode;
  }
}
