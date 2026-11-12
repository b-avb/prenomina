import type { ApprovalProjectDetail, ApprovalRequestAnnex3, ApprovalStatus } from '@usta/domain';
import type { DbExecutor } from '../../database/database.types.js';
import type { LockOptions } from '../../models/persistence.models.js';
import type { ApprovalRequestRepository } from '../approval-request.repository.js';
import {
  type ApprovalRequestRow,
  toApprovalProjectDetail,
  toApprovalRequest,
  toApprovalRequestProjectRows,
  toApprovalRequestRow,
} from './mappers/approval-request.mapper.js';

/**
 * MariaDB adapter for `approval_requests` and child `approval_request_projects`,
 * joining unit, teacher, and SAC catalog tables for read projections.
 */
export class MariaDbApprovalRequestRepository implements ApprovalRequestRepository {
  public async listByPeriod(
    db: DbExecutor,
    periodCode: string,
    filter: { unitId?: string; status?: ApprovalStatus } = {},
  ): Promise<ApprovalRequestAnnex3[]> {
    let query = this.baseQuery(db).where('a.period_code', '=', periodCode);
    if (filter.unitId) query = query.where('a.unit_id', '=', filter.unitId);
    if (filter.status) query = query.where('a.status', '=', filter.status);
    const rows = await query
      .orderBy('a.requested_at', 'desc')
      .orderBy('a.insertion_order', 'desc')
      .execute();
    return this.hydrateMany(db, rows);
  }

  public async findById(
    db: DbExecutor,
    id: string,
    options: LockOptions = {},
  ): Promise<ApprovalRequestAnnex3 | undefined> {
    let query = this.baseQuery(db).where('a.id', '=', id);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    if (!row) return undefined;
    const [hydrated] = await this.hydrateMany(db, [row]);
    return hydrated;
  }

  public async findByTeacherAndCode(
    db: DbExecutor,
    teacherId: string,
    code: string,
    options: LockOptions = {},
  ): Promise<ApprovalRequestAnnex3 | undefined> {
    let query = this.baseQuery(db)
      .where('a.teacher_id', '=', teacherId)
      .where('a.code', '=', code);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    if (!row) return undefined;
    const [hydrated] = await this.hydrateMany(db, [row]);
    return hydrated;
  }

  public async insertMany(db: DbExecutor, requests: ApprovalRequestAnnex3[]): Promise<void> {
    if (requests.length === 0) return;
    await db.insertInto('approval_requests').values(requests.map(toApprovalRequestRow)).execute();
    const projectRows = requests.flatMap(toApprovalRequestProjectRows);
    if (projectRows.length > 0) {
      await db.insertInto('approval_request_projects').values(projectRows).execute();
    }
  }

  public async update(db: DbExecutor, request: ApprovalRequestAnnex3): Promise<void> {
    const { id, ...changes } = toApprovalRequestRow(request);
    await db.updateTable('approval_requests').set(changes).where('id', '=', id).execute();
    await db
      .deleteFrom('approval_request_projects')
      .where('approval_request_id', '=', id)
      .execute();
    const projectRows = toApprovalRequestProjectRows(request);
    if (projectRows.length > 0) {
      await db.insertInto('approval_request_projects').values(projectRows).execute();
    }
  }

  /** Batch-loads child `approval_request_projects` ordered by `sort_order` to avoid N+1 queries. */
  private async hydrateMany(
    db: DbExecutor,
    rows: ApprovalRequestRow[],
  ): Promise<ApprovalRequestAnnex3[]> {
    if (rows.length === 0) return [];
    const requestIds = rows.map((r) => r.id);
    const projectRows = await db
      .selectFrom('approval_request_projects')
      .selectAll()
      .where('approval_request_id', 'in', requestIds)
      .orderBy('approval_request_id')
      .orderBy('sort_order')
      .execute();

    const projectsByRequestId = new Map<string, ApprovalProjectDetail[]>();
    for (const projectRow of projectRows) {
      let bucket = projectsByRequestId.get(projectRow.approval_request_id);
      if (!bucket) {
        bucket = [];
        projectsByRequestId.set(projectRow.approval_request_id, bucket);
      }
      bucket.push(toApprovalProjectDetail(projectRow));
    }

    return rows.map((row) =>
      toApprovalRequest(row, projectsByRequestId.get(row.id) ?? []),
    );
  }

  private baseQuery(db: DbExecutor) {
    return db
      .selectFrom('approval_requests as a')
      .innerJoin('academic_units as u', 'u.id', 'a.unit_id')
      .innerJoin('teachers as t', 't.id', 'a.teacher_id')
      .innerJoin('sac_codes as s', 's.code', 'a.code')
      .selectAll('a')
      .select([
        'u.name as unit_name',
        't.full_name as teacher_name',
        't.document_id as teacher_document_id',
        's.name as code_name',
      ]);
  }
}
