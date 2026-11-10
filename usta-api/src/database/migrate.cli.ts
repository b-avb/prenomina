import { ENV_CONFIG } from '../config/env.config.js';
import { createDatabase, describeDatabaseTarget } from './connection.js';
import { migrateToLatest } from './migrations/index.js';

/** CLI entrypoint for `pnpm db:migrate`: applies every pending migration. */
async function main(): Promise<void> {
  const db = createDatabase(ENV_CONFIG.database);
  try {
    console.log(`[db:migrate] Target ${describeDatabaseTarget(ENV_CONFIG.database)}`);
    const { applied } = await migrateToLatest(db);
    console.log(
      applied.length > 0
        ? `[db:migrate] Applied: ${applied.join(', ')}`
        : '[db:migrate] Schema already up to date.',
    );
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('[db:migrate] Failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
