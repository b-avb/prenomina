import { ENV_CONFIG } from '../config/env.config.js';
import { createDatabase } from './connection.js';
import { KyselyTransactionRunner } from './transaction-runner.js';
import { UuidIdGenerator } from '../infrastructure/uuid-id-generator.js';
import { createMariaDbRepositories } from '../repositories/mariadb/index.js';
import { seedDatabaseWithOfficialData } from '../seed/database-seeder.js';

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const useTsSeed = process.argv.includes('--ts-seed');
  const db = createDatabase(ENV_CONFIG.database);
  const tx = new KyselyTransactionRunner(db);
  const repos = createMariaDbRepositories();
  const ids = new UuidIdGenerator();

  try {
    const result = await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: force,
      preferJsonSnapshot: !useTsSeed,
    });
    if (result.seeded) {
      console.log(`[db:seed] MariaDB seeded successfully (source: ${result.source}).`);
    } else {
      console.log('[db:seed] Database already contains data. Pass --force to overwrite.');
    }
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error('[db:seed] Failed to seed database:', err);
  process.exit(1);
});
