import type { DbExecutor } from '../database/database.types.js';
import type { LockOptions, UserRecord } from '../models/persistence.models.js';

export interface UserRepository {
  listAll(db: DbExecutor): Promise<UserRecord[]>;
  findById(db: DbExecutor, id: string, options?: LockOptions): Promise<UserRecord | undefined>;
  findByUsername(
    db: DbExecutor,
    username: string,
    options?: LockOptions,
  ): Promise<UserRecord | undefined>;
  findByEmail(
    db: DbExecutor,
    email: string,
    options?: LockOptions,
  ): Promise<UserRecord | undefined>;
  findByEntraOid(
    db: DbExecutor,
    entraOid: string,
    options?: LockOptions,
  ): Promise<UserRecord | undefined>;
  findByUnitId(
    db: DbExecutor,
    unitId: string,
    options?: LockOptions,
  ): Promise<UserRecord | undefined>;
  count(db: DbExecutor): Promise<number>;
  insertMany(db: DbExecutor, users: UserRecord[]): Promise<void>;
  update(db: DbExecutor, user: UserRecord): Promise<void>;
}
