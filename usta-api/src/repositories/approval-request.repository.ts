import type { ApprovalRequestAnnex3, ApprovalStatus } from '@usta/domain';
import type { DbExecutor } from '../database/database.types.js';
import type { LockOptions } from '../models/persistence.models.js';

/** Persistence port for Annex 3 Vice-Rectorate special approval requests and resolution metadata. */
export interface ApprovalRequestRepository {
  listByPeriod(
    db: DbExecutor,
    periodCode: string,
    filter?: { unitId?: string; status?: ApprovalStatus },
  ): Promise<ApprovalRequestAnnex3[]>;
  findById(db: DbExecutor, id: string, options?: LockOptions): Promise<ApprovalRequestAnnex3 | undefined>;
  findByTeacherAndCode(
    db: DbExecutor,
    teacherId: string,
    code: string,
    options?: LockOptions,
  ): Promise<ApprovalRequestAnnex3 | undefined>;
  insertMany(db: DbExecutor, requests: ApprovalRequestAnnex3[]): Promise<void>;
  update(db: DbExecutor, request: ApprovalRequestAnnex3): Promise<void>;
}
