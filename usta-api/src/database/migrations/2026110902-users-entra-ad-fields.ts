import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE users
    ADD COLUMN email VARCHAR(180) NULL AFTER username,
    ADD COLUMN entra_oid VARCHAR(64) NULL AFTER email,
    ADD COLUMN auth_provider ENUM('local','microsoft_entra','hybrid') NOT NULL DEFAULT 'hybrid' AFTER entra_oid,
    ADD COLUMN last_login_at DATETIME(3) NULL AFTER password_changed_at,
    ADD UNIQUE KEY uq_users_email (email),
    ADD UNIQUE KEY uq_users_entra_oid (entra_oid)`.execute(db);

  await sql`UPDATE users
    SET email = CONCAT(username, '@santototunja.edu.co')
    WHERE email IS NULL`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE users
    DROP INDEX uq_users_entra_oid,
    DROP INDEX uq_users_email,
    DROP COLUMN last_login_at,
    DROP COLUMN auth_provider,
    DROP COLUMN entra_oid,
    DROP COLUMN email`.execute(db);
}
