import { Kysely, MysqlDialect, type MysqlPool } from 'kysely';
import { createPool } from 'mysql2';
import type { DatabaseConfig } from '../config/env.config.js';
import type { Database } from './database.types.js';

/**
 * Builds the Kysely instance backed by a mysql2 connection pool.
 * DECIMAL values are returned as JS numbers and DATETIME values are read/written in UTC.
 */
export function createDatabase(config: DatabaseConfig): Kysely<Database> {
  const pool = createPool({
    host: config.host,
    port: config.port,
    database: config.name,
    user: config.user,
    password: config.password,
    connectionLimit: config.poolLimit,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    decimalNumbers: true,
    supportBigNumbers: true,
    waitForConnections: true,
  });

  return new Kysely<Database>({
    dialect: new MysqlDialect({ pool: pool as unknown as MysqlPool }),
  });
}

/** Human-readable connection target that never includes credentials. */
export function describeDatabaseTarget(config: DatabaseConfig): string {
  return `mariadb://${config.user}@${config.host}:${config.port}/${config.name}`;
}
