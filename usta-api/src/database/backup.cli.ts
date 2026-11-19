import { mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createConnection, escape, escapeId, type RowDataPacket } from 'mysql2/promise';
import { ENV_CONFIG } from '../config/env.config.js';
import { describeDatabaseTarget } from './connection.js';

interface CliOptions {
  backupDir: string;
  keepCount: number;
  restoreFile: string | null;
}

function parseCliArgs(argv: string[]): CliOptions {
  let backupDir = resolve(process.cwd(), '..', 'backups');
  let keepCount = 20;
  let restoreFile: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dir' && argv[i + 1]) {
      backupDir = resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--keep' && argv[i + 1]) {
      const parsed = Number.parseInt(argv[i + 1], 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        keepCount = parsed;
      }
      i += 1;
    } else if (arg === '--restore' && argv[i + 1]) {
      restoreFile = resolve(argv[i + 1]);
      i += 1;
    }
  }

  return { backupDir, keepCount, restoreFile };
}

function formatUtcTimestamp(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    '_',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join('');
}

function rotateOldBackups(backupDir: string, prefix: string, keepCount: number): void {
  const entries = readdirSync(backupDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.sql.gz'))
    .map((name) => {
      const fullPath = join(backupDir, name);
      return { name, fullPath, mtimeMs: statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const stale of entries.slice(keepCount)) {
    unlinkSync(stale.fullPath);
  }
}

/** Splits SQL dump statements at top-level `;\n` boundaries while respecting quoted strings. */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let inSingleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    if (inSingleQuote) {
      if (ch === '\\') {
        i += 1;
      } else if (ch === "'") {
        if (sql[i + 1] === "'") {
          i += 1;
        } else {
          inSingleQuote = false;
        }
      }
    } else if (inBacktick) {
      if (ch === '`') {
        if (sql[i + 1] === '`') {
          i += 1;
        } else {
          inBacktick = false;
        }
      }
    } else if (ch === "'") {
      inSingleQuote = true;
    } else if (ch === '`') {
      inBacktick = true;
    } else if (ch === ';' && (sql[i + 1] === '\n' || sql[i + 1] === '\r' || i + 1 === sql.length)) {
      const stmt = sql.slice(start, i).trim();
      if (stmt.length > 0 && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      start = i + 1;
    }
  }

  const trailing = sql.slice(start).trim();
  if (trailing.length > 0 && !trailing.startsWith('--')) {
    statements.push(trailing);
  }
  return statements;
}

async function createBackup(options: CliOptions): Promise<void> {
  const cfg = ENV_CONFIG.database;
  const conn = await createConnection({
    host: cfg.host,
    port: cfg.port,
    database: cfg.name,
    user: cfg.user,
    password: cfg.password,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

  try {
    const [tableRows] = await conn.query<RowDataPacket[]>(
      "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'",
    );
    const tableNames = tableRows
      .map((row) => String(Object.values(row)[0] ?? ''))
      .filter((name) => name.length > 0)
      .sort();

    if (tableNames.length === 0) {
      console.log(
        `[db:backup] Empty database (${describeDatabaseTarget(cfg)}), skipping pre-deploy backup.`,
      );
      return;
    }

    const ddlByTable = new Map<string, string>();
    for (const table of tableNames) {
      const [createRows] = await conn.query<RowDataPacket[]>(`SHOW CREATE TABLE ${escapeId(table)}`);
      const createRow = createRows[0];
      const createSql = String(createRow?.['Create Table'] ?? Object.values(createRow ?? {})[1] ?? '');
      ddlByTable.set(table, createSql);
    }

    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await conn.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');

    const chunks: string[] = [
      `-- USTA Prenómina pre-deploy SQL backup (${new Date().toISOString()})\n`,
      `-- Database: ${cfg.name}\n`,
      'SET NAMES utf8mb4;\n',
      "SET TIME_ZONE = '+00:00';\n",
      'SET FOREIGN_KEY_CHECKS = 0;\n\n',
    ];

    let totalRows = 0;
    const batchSize = 250;

    for (const table of tableNames) {
      const createSql = ddlByTable.get(table) ?? '';
      chunks.push(`DROP TABLE IF EXISTS ${escapeId(table)};\n`);
      chunks.push(`${createSql};\n`);

      const [rows] = await conn.query<RowDataPacket[]>(`SELECT * FROM ${escapeId(table)}`);
      if (rows.length > 0) {
        totalRows += rows.length;
        const columns = Object.keys(rows[0]);
        const colList = columns.map((col) => escapeId(col)).join(', ');

        for (let offset = 0; offset < rows.length; offset += batchSize) {
          const slice = rows.slice(offset, offset + batchSize);
          const valuesSql = slice
            .map((row) => `(${columns.map((col) => escape(row[col])).join(', ')})`)
            .join(',\n  ');
          chunks.push(`INSERT INTO ${escapeId(table)} (${colList}) VALUES\n  ${valuesSql};\n`);
        }
      }
      chunks.push('\n');
    }

    chunks.push('SET FOREIGN_KEY_CHECKS = 1;\n');
    await conn.query('COMMIT');

    mkdirSync(options.backupDir, { recursive: true, mode: 0o750 });
    const safeDbName = cfg.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const prefix = `db_${safeDbName}_`;
    const fileName = `${prefix}${formatUtcTimestamp(new Date())}.sql.gz`;
    const targetPath = join(options.backupDir, fileName);

    const compressed = gzipSync(Buffer.from(chunks.join(''), 'utf8'), { level: 9 });
    writeFileSync(targetPath, compressed, { mode: 0o600 });
    rotateOldBackups(options.backupDir, prefix, options.keepCount);

    const sizeKb = (compressed.byteLength / 1024).toFixed(1);
    console.log(
      `[db:backup] Saved ${tableNames.length} tables (${totalRows} rows, ${sizeKb} KB) -> ${targetPath}`,
    );
  } finally {
    await conn.end();
  }
}

async function restoreBackup(filePath: string): Promise<void> {
  const cfg = ENV_CONFIG.database;
  const rawBuffer = readFileSync(filePath);
  const sqlText = filePath.endsWith('.gz')
    ? gunzipSync(rawBuffer).toString('utf8')
    : rawBuffer.toString('utf8');

  const statements = splitSqlStatements(sqlText);
  const conn = await createConnection({
    host: cfg.host,
    port: cfg.port,
    database: cfg.name,
    user: cfg.user,
    password: cfg.password,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
  });

  try {
    console.log(
      `[db:restore] Restoring ${statements.length} SQL statements from ${filePath} into ${describeDatabaseTarget(cfg)}...`,
    );
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[db:restore] Database restore completed.');
  } finally {
    await conn.end();
  }
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.restoreFile) {
    await restoreBackup(options.restoreFile);
  } else {
    await createBackup(options);
  }
}

main().catch((error: unknown) => {
  console.error('[db:backup] Failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
