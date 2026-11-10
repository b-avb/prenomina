import type { Kysely } from 'kysely';
import type { Database, DbExecutor } from './database.types.js';

/**
 * Unit-of-Work abstraction. Services depend on this port instead of on Kysely directly:
 * `run` executes multi-table writes atomically, `executor` serves plain reads.
 */
export interface TransactionRunner {
  readonly executor: DbExecutor;
  run<T>(work: (trx: DbExecutor) => Promise<T>): Promise<T>;
}

export class KyselyTransactionRunner implements TransactionRunner {
  public readonly executor: DbExecutor;

  constructor(db: Kysely<Database>) {
    this.executor = db;
  }

  public run<T>(work: (trx: DbExecutor) => Promise<T>): Promise<T> {
    return this.executor.transaction().execute(work);
  }
}
