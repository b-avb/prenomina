/**
 * HTTP entry point and dependency composition root for the USTA Tunja payroll pre-liquidation API.
 * Wires Kysely/MariaDB repositories, domain services, JWT actor resolution, and ordered pool shutdown.
 */
import { ENV_CONFIG } from './config/env.config.js';
import http from 'node:http';
import { JwtActorResolver } from './auth/actor-resolver.js';
import { assertProductionAuthSecret } from './auth/password-crypto.js';
import { AcademicProgramsController } from './controllers/academic-programs.controller.js';
import { AcademicUnitsController } from './controllers/academic-units.controller.js';
import { ApprovalsController } from './controllers/approvals.controller.js';
import { AuditLogsController } from './controllers/audit-logs.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { FacultyTeachersController } from './controllers/faculty-teachers.controller.js';
import { PayrollStateController } from './controllers/payroll-state.controller.js';
import { ResearchController } from './controllers/research.controller.js';
import { SacCatalogController } from './controllers/sac-catalog.controller.js';
import { ValidationEngineController } from './controllers/validation-engine.controller.js';
import { createDatabase, describeDatabaseTarget } from './database/connection.js';
import { migrateToLatest } from './database/migrations/index.js';
import { KyselyTransactionRunner } from './database/transaction-runner.js';
import { UuidIdGenerator } from './infrastructure/uuid-id-generator.js';
import { createMariaDbRepositories } from './repositories/mariadb/index.js';
import { ApiRouter } from './routes/router.js';
import { AcademicProgramsService } from './services/academic-programs.service.js';
import { AcademicUnitsService } from './services/academic-units.service.js';
import { ApprovalsService } from './services/approvals.service.js';
import { AuditService } from './services/audit.service.js';
import { AuthService } from './services/auth.service.js';
import { FacultyTeachersService } from './services/faculty-teachers.service.js';
import { PayrollStateService } from './services/payroll-state.service.js';
import { PeriodContextService } from './services/period-context.service.js';
import { ResearchService } from './services/research.service.js';
import { SacCatalogService } from './services/sac-catalog.service.js';
import { ValidationEngineService } from './services/validation-engine.service.js';

assertProductionAuthSecret();

const db = createDatabase(ENV_CONFIG.database);
const tx = new KyselyTransactionRunner(db);
const repos = createMariaDbRepositories();
const ids = new UuidIdGenerator();
const actorResolver = new JwtActorResolver(tx.executor, repos.users, repos.units);

const periodContext = new PeriodContextService(repos);
const auditService = new AuditService(tx, repos, ids);
const authService = new AuthService(tx, repos, periodContext, auditService, ids);

const payrollStateService = new PayrollStateService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
);
const academicUnitsService = new AcademicUnitsService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
  authService,
);
const academicProgramsService = new AcademicProgramsService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
);
const sacCatalogService = new SacCatalogService(
  tx,
  repos,
  periodContext,
  auditService,
);
const facultyTeachersService = new FacultyTeachersService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
);
const validationEngineService = new ValidationEngineService(
  tx,
  repos,
  periodContext,
);
const approvalsService = new ApprovalsService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
);
const researchService = new ResearchService(
  tx,
  repos,
  periodContext,
  auditService,
  ids,
);

const router = new ApiRouter(
  {
    auth: new AuthController(authService, actorResolver),
    payrollState: new PayrollStateController(payrollStateService, actorResolver),
    academicUnits: new AcademicUnitsController(academicUnitsService, actorResolver),
    academicPrograms: new AcademicProgramsController(
      academicProgramsService,
      actorResolver,
    ),
    sacCatalog: new SacCatalogController(sacCatalogService, actorResolver),
    facultyTeachers: new FacultyTeachersController(
      facultyTeachersService,
      actorResolver,
    ),
    validationEngine: new ValidationEngineController(validationEngineService),
    approvals: new ApprovalsController(approvalsService, actorResolver),
    research: new ResearchController(researchService, actorResolver),
    auditLogs: new AuditLogsController(auditService),
  },
  actorResolver,
);

const server = http.createServer(router.dispatch);

/**
 * Applies pending schema migrations and idempotent institutional user seeds before binding the HTTP socket.
 * Startup migration/seed errors are logged without aborting socket bind so health endpoints remain reachable for diagnostics.
 */
async function bootstrap(): Promise<void> {
  try {
    const { applied } = await migrateToLatest(db);
    if (applied.length > 0) {
      console.log(`[USTA-API-TS] Auto-applied DB migrations: ${applied.join(', ')}`);
    }
    const count = await authService.ensureDefaultUsersSeeded();
    if (count > 0) {
      console.log(`[USTA-API-TS] Seeded ${count} default institutional user accounts.`);
    }
  } catch (err) {
    console.warn('[USTA-API-TS] Warning during startup DB migration/bootstrap:', err);
  }

  server.listen(ENV_CONFIG.port, ENV_CONFIG.host, () => {
    console.log(
      `[USTA-API-TS] Enterprise Backend listening on http://${ENV_CONFIG.host}:${ENV_CONFIG.port}`,
    );
    console.log(
      `[USTA-API-TS] MariaDB pool connected to ${describeDatabaseTarget(ENV_CONFIG.database)}`,
    );
  });
}

void bootstrap();

/** Stops accepting new HTTP connections and drains the MariaDB connection pool on process termination signals. */
async function shutdown(signal: string): Promise<void> {
  console.log(`[USTA-API-TS] Received ${signal}. Closing server and MariaDB pool...`);
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
