import { Migrator, type Kysely, type Migration, type MigrationProvider } from 'kysely';
import type { Database } from '../database.types.js';
import * as initialSchema from './2026110501-initial-schema.js';
import * as usersAuth from './2026110901-users-auth.js';
import * as usersEntraAdFields from './2026110902-users-entra-ad-fields.js';
import * as allocationProgram from './2026111101-allocation-program.js';

/**
 * Static (in-code) migration registry: works identically from `src` and `dist`
 * without filesystem globbing. Append new migrations with a sortable key.
 */
const MIGRATIONS: Readonly<Record<string, Migration>> = {
  '2026110501-initial-schema': initialSchema,
  '2026110901-users-auth': usersAuth,
  '2026110902-users-entra-ad-fields': usersEntraAdFields,
  '2026111101-allocation-program': allocationProgram,
};

class StaticMigrationProvider implements MigrationProvider {
  public getMigrations(): Promise<Record<string, Migration>> {
    return Promise.resolve({ ...MIGRATIONS });
  }
}

export interface MigrationReport {
  applied: string[];
}

export async function migrateToLatest(db: Kysely<Database>): Promise<MigrationReport> {
  const migrator = new Migrator({ db, provider: new StaticMigrationProvider() });
  const { error, results = [] } = await migrator.migrateToLatest();
  const failed = results.find((result) => result.status === 'Error');
  if (error || failed) {
    const reason = error instanceof Error ? error.message : String(error ?? 'unknown error');
    throw new Error(`Migration '${failed?.migrationName ?? 'n/a'}' failed: ${reason}`);
  }
  return {
    applied: results
      .filter((result) => result.status === 'Success')
      .map((result) => result.migrationName),
  };
}
