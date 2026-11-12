import { ENV_CONFIG } from '../config/env.config.js';
import { createDatabase } from './connection.js';
import { KyselyTransactionRunner } from './transaction-runner.js';
import { UuidIdGenerator } from '../infrastructure/uuid-id-generator.js';
import { createMariaDbRepositories } from '../repositories/mariadb/index.js';
import { seedDatabaseWithOfficialData } from '../seed/database-seeder.js';

/**
 * CLI entrypoint for `pnpm db:seed`. Reconciles institutional catalogs and user accounts
 * non-destructively by default, or truncates and reseeds all tables when `--force` is passed.
 */
async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const db = createDatabase(ENV_CONFIG.database);
  const tx = new KyselyTransactionRunner(db);
  const repos = createMariaDbRepositories();
  const ids = new UuidIdGenerator();

  try {
    const result = await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: force,
    });
    if (result.seeded) {
      console.log(`[db:seed] Database seeded successfully (${result.source}).`);
    } else {
      console.log(
        '[db:seed] Existing database synchronized with official institutional accounts and clean catalog.',
      );
    }
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error('[db:seed] Failed to seed database:', err);
  process.exit(1);
});
