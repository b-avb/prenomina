import { sql, type Kysely } from 'kysely';

const TABLE_OPTIONS = sql.raw('ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE TABLE users (
    insertion_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    username VARCHAR(80) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(180) NOT NULL,
    role ENUM('director','dean','vice_rector','research') NOT NULL,
    unit_id VARCHAR(64) NULL,
    must_change_password TINYINT(1) NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    password_changed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_insertion_order (insertion_order),
    UNIQUE KEY uq_users_username (username),
    KEY idx_users_role_unit (role, unit_id),
    CONSTRAINT fk_users_unit FOREIGN KEY (unit_id)
      REFERENCES academic_units (id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ${TABLE_OPTIONS}`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE IF EXISTS users`.execute(db);
}
