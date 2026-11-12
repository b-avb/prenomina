import { INSTITUTIONAL_EMAIL_DOMAIN } from '@usta/domain';
import type { Insertable, Selectable } from 'kysely';
import type { DbExecutor, Flag, UsersTable } from '../../database/database.types.js';
import type { LockOptions, UserRecord } from '../../models/persistence.models.js';
import type { UserRepository } from '../user.repository.js';

function toFlag(value: boolean): Flag {
  return value ? 1 : 0;
}

function toUserRecord(row: Selectable<UsersTable>): UserRecord {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    entraOid: row.entra_oid,
    authProvider: row.auth_provider,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role,
    unitId: row.unit_id,
    mustChangePassword: row.must_change_password === 1,
    isActive: row.is_active === 1,
    passwordChangedAt: row.password_changed_at ? row.password_changed_at.toISOString() : null,
    lastLoginAt: row.last_login_at ? row.last_login_at.toISOString() : null,
    updatedAt: row.updated_at.toISOString(),
  };
}

function toUserRow(user: UserRecord): Insertable<UsersTable> {
  const normalizedUsername = user.username.trim().toLowerCase();
  const normalizedEmail =
    user.email?.trim().toLowerCase() || `${normalizedUsername}@${INSTITUTIONAL_EMAIL_DOMAIN}`;
  return {
    id: user.id,
    username: normalizedUsername,
    email: normalizedEmail,
    entra_oid: user.entraOid?.trim() || null,
    auth_provider: user.authProvider ?? 'hybrid',
    password_hash: user.passwordHash,
    full_name: user.fullName.trim(),
    role: user.role,
    unit_id: user.unitId ?? null,
    must_change_password: toFlag(user.mustChangePassword),
    is_active: toFlag(user.isActive),
    password_changed_at: user.passwordChangedAt ? new Date(user.passwordChangedAt) : null,
    last_login_at: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
    updated_at: user.updatedAt ? new Date(user.updatedAt) : new Date(),
  };
}

/**
 * MariaDB adapter for `users`, normalizing `username` and `email` to lowercase on read/write.
 */
export class MariaDbUserRepository implements UserRepository {
  public async listAll(db: DbExecutor): Promise<UserRecord[]> {
    const rows = await db.selectFrom('users').selectAll().orderBy('insertion_order').execute();
    return rows.map(toUserRecord);
  }

  public async findById(
    db: DbExecutor,
    id: string,
    options: LockOptions = {},
  ): Promise<UserRecord | undefined> {
    let query = db.selectFrom('users').selectAll().where('id', '=', id);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toUserRecord(row) : undefined;
  }

  public async findByUsername(
    db: DbExecutor,
    username: string,
    options: LockOptions = {},
  ): Promise<UserRecord | undefined> {
    const normalized = username.trim().toLowerCase();
    let query = db.selectFrom('users').selectAll().where('username', '=', normalized);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toUserRecord(row) : undefined;
  }

  public async findByEmail(
    db: DbExecutor,
    email: string,
    options: LockOptions = {},
  ): Promise<UserRecord | undefined> {
    const normalized = email.trim().toLowerCase();
    let query = db.selectFrom('users').selectAll().where('email', '=', normalized);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toUserRecord(row) : undefined;
  }

  public async findByEntraOid(
    db: DbExecutor,
    entraOid: string,
    options: LockOptions = {},
  ): Promise<UserRecord | undefined> {
    const normalized = entraOid.trim();
    let query = db.selectFrom('users').selectAll().where('entra_oid', '=', normalized);
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toUserRecord(row) : undefined;
  }

  /** Looks up the earliest-registered `dean` account assigned directly to `unitId`. */
  public async findByUnitId(
    db: DbExecutor,
    unitId: string,
    options: LockOptions = {},
  ): Promise<UserRecord | undefined> {
    let query = db
      .selectFrom('users')
      .selectAll()
      .where('unit_id', '=', unitId)
      .where('role', '=', 'dean')
      .orderBy('insertion_order');
    if (options.forUpdate) query = query.forUpdate();
    const row = await query.executeTakeFirst();
    return row ? toUserRecord(row) : undefined;
  }

  public async count(db: DbExecutor): Promise<number> {
    const { total } = await db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();
    return Number(total);
  }

  public async insertMany(db: DbExecutor, users: UserRecord[]): Promise<void> {
    if (users.length === 0) return;
    await db.insertInto('users').values(users.map(toUserRow)).execute();
  }

  public async update(db: DbExecutor, user: UserRecord): Promise<void> {
    const { id, ...changes } = toUserRow(user);
    await db.updateTable('users').set(changes).where('id', '=', id).execute();
  }
}
