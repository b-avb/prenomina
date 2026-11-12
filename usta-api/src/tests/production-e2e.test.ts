import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import {
  type AcademicPeriod,
  type AcademicUnitSummary,
  type ApiFailure,
  type ApiSuccess,
  type ApprovalAttachmentResponse,
  type ApprovalRequestAnnex3,
  type AuditLogEntry,
  type AuthConfigResponse,
  type AuthSessionResponse,
  type AuthUser,
  type BusinessRulesConfig,
  type DeletedResponse,
  type FacultyTeacher,
  type HealthResponse,
  type PayrollSnapshot,
  type ProgramMutationResponse,
  type ProgramQuotaAnnex5,
  type ResearchAllocationAnnex7,
  type ResearchMutationResponse,
  type ResetUserPasswordResponse,
  type SacCode,
  type SchedulePhase,
  type UnitVersionSnapshotResponse,
  type UnitWithDirectorResponse,
  WorkloadCalculatorDomain,
} from '@usta/domain';
import { JwtActorResolver } from '../auth/actor-resolver.js';
import { hashPassword } from '../auth/password-crypto.js';
import { ENV_CONFIG } from '../config/env.config.js';
import { AcademicProgramsController } from '../controllers/academic-programs.controller.js';
import { AcademicUnitsController } from '../controllers/academic-units.controller.js';
import { ApprovalsController } from '../controllers/approvals.controller.js';
import { AuditLogsController } from '../controllers/audit-logs.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { FacultyTeachersController } from '../controllers/faculty-teachers.controller.js';
import { PayrollStateController } from '../controllers/payroll-state.controller.js';
import { ResearchController } from '../controllers/research.controller.js';
import { SacCatalogController } from '../controllers/sac-catalog.controller.js';
import { ValidationEngineController } from '../controllers/validation-engine.controller.js';
import { createDatabase } from '../database/connection.js';
import { migrateToLatest } from '../database/migrations/index.js';
import { KyselyTransactionRunner } from '../database/transaction-runner.js';
import { UuidIdGenerator } from '../infrastructure/uuid-id-generator.js';
import { createMariaDbRepositories } from '../repositories/mariadb/index.js';
import { ApiRouter } from '../routes/router.js';
import { seedDatabaseWithOfficialData } from '../seed/database-seeder.js';
import { AcademicProgramsService } from '../services/academic-programs.service.js';
import { AcademicUnitsService } from '../services/academic-units.service.js';
import { ApprovalsService } from '../services/approvals.service.js';
import { AuditService } from '../services/audit.service.js';
import { AuthService } from '../services/auth.service.js';
import { FacultyTeachersService } from '../services/faculty-teachers.service.js';
import { PayrollStateService } from '../services/payroll-state.service.js';
import { PeriodContextService } from '../services/period-context.service.js';
import { ResearchService } from '../services/research.service.js';
import { SacCatalogService } from '../services/sac-catalog.service.js';
import {
  ValidationEngineService,
  type UnitValidationEvaluation,
} from '../services/validation-engine.service.js';

const E2E_INITIAL_TEMP_PASSWORD = 'E2eInitPassword2026*';

interface HttpCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface HttpCallResult<T> {
  status: number;
  payload: ApiSuccess<T> | ApiFailure | null;
}

/**
 * End-to-end integration suite exercising the HTTP router, controllers, services,
 * JWT RBAC guards, and MariaDB repositories against a live ephemeral loopback server.
 */
async function runProductionE2ESuite(): Promise<void> {
  const db = createDatabase(ENV_CONFIG.database);
  await migrateToLatest(db);
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
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function request<T>(options: HttpCallOptions): Promise<HttpCallResult<T>> {
    const headers: Record<string, string> = {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    };
    const response = await fetch(`${baseUrl}${options.path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    if (response.status === 204) {
      return { status: 204, payload: null };
    }
    const json = (await response.json()) as ApiSuccess<T> | ApiFailure;
    return { status: response.status, payload: json };
  }

  function expectData<T>(result: HttpCallResult<T>, expectedStatus: number, stepLabel: string): T {
    assert.equal(
      result.status,
      expectedStatus,
      `[${stepLabel}] Expected HTTP ${expectedStatus} but received ${result.status}: ${JSON.stringify(result.payload)}`,
    );
    assert.ok(
      result.payload && result.payload.ok === true,
      `[${stepLabel}] Expected ok:true payload`,
    );
    return result.payload.data;
  }

  function expectError(
    result: HttpCallResult<unknown>,
    expectedStatus: number,
    stepLabel: string,
  ): ApiFailure {
    assert.equal(
      result.status,
      expectedStatus,
      `[${stepLabel}] Expected error HTTP ${expectedStatus} but received ${result.status}: ${JSON.stringify(result.payload)}`,
    );
    assert.ok(
      result.payload && result.payload.ok === false,
      `[${stepLabel}] Expected ok:false error payload`,
    );
    return result.payload;
  }

  let passedAssertions = 0;
  function recordStep(label: string): void {
    passedAssertions++;
    console.log(`  ✔ [${passedAssertions.toString().padStart(2, '0')}] ${label}`);
  }

  const uploadedTestFiles: string[] = [];

  try {
    console.log('\n====================================================================');
    console.log(' USTA TUNJA — PRODUCTION E2E SUITE (REAL HTTP + REAL MARIADB, 0 MOCKS)');
    console.log('====================================================================\n');

    // Reset tables to a deterministic baseline with a known initial temporary password hash.
    await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: true,
      overridePasswordHash: hashPassword(E2E_INITIAL_TEMP_PASSWORD),
    });
    const seededAuditCount = await repos.auditLogs.list(tx.executor, {
      periodCode: '2026-2',
      limit: 10,
    });
    assert.equal(seededAuditCount.length, 0);

    // Health probe, hybrid auth discovery, and mandatory first-login password rotation.
    const healthRes = await request<HealthResponse>({ path: '/api/health' });
    const health = expectData(healthRes, 200, 'GET /api/health');
    assert.equal(health.status, 'ok');
    assert.equal(health.database, 'up');
    recordStep('UC-0.1 System health & MariaDB connectivity verified (GET /api/health)');

    const authConfigRes = await request<AuthConfigResponse>({ path: '/api/auth/config' });
    const authConfig = expectData(authConfigRes, 200, 'GET /api/auth/config');
    assert.equal(authConfig.allowLocalLogin, true);
    assert.ok(authConfig.microsoftEntra.institutionalDomain.length > 0);
    recordStep(
      `UC-0.2 Hybrid Auth & Microsoft Entra ID configuration verified (domain: @${authConfig.microsoftEntra.institutionalDomain})`,
    );

    /**
     * Logs in with a temporary password, verifies `PASSWORD_CHANGE_REQUIRED` enforcement on
     * business routes, rotates the password, and confirms immediate `pwdChangedAt` token revocation.
     */
    async function authenticateAndActivateAccount(
      username: string,
      newPersonalPassword: string,
      initialPassword: string = E2E_INITIAL_TEMP_PASSWORD,
    ): Promise<{ token: string; user: AuthUser }> {
      const loginRes = await request<AuthSessionResponse>({
        method: 'POST',
        path: '/api/auth/login',
        body: { username, password: initialPassword },
      });
      const initialSession = expectData(loginRes, 200, `POST /api/auth/login (${username})`);
      assert.equal(initialSession.user.mustChangePassword, true);

      const blockedStateRes = await request<PayrollSnapshot>({
        path: '/api/state',
        token: initialSession.token,
      });
      const blockedErr = expectError(
        blockedStateRes,
        403,
        `Blocked GET /api/state before password change (${username})`,
      );
      assert.equal(blockedErr.code, 'PASSWORD_CHANGE_REQUIRED');

      const changeRes = await request<AuthSessionResponse>({
        method: 'POST',
        path: '/api/auth/change-password',
        token: initialSession.token,
        body: {
          currentPassword: initialPassword,
          newPassword: newPersonalPassword,
        },
      });
      const activeSession = expectData(
        changeRes,
        200,
        `POST /api/auth/change-password (${username})`,
      );
      assert.equal(activeSession.user.mustChangePassword, false);

      const oldTokenCheck = await request<AuthUser>({
        path: '/api/auth/me',
        token: initialSession.token,
      });
      expectError(oldTokenCheck, 401, `Revoked old JWT after password change (${username})`);

      const meCheck = await request<AuthUser>({
        path: '/api/auth/me',
        token: activeSession.token,
      });
      const meUser = expectData(meCheck, 200, `GET /api/auth/me (${username})`);
      assert.equal(meUser.username, username);
      assert.equal(meUser.mustChangePassword, false);

      return activeSession;
    }

    const directorSession = await authenticateAndActivateAccount(
      'dir.ensenanza',
      'DirectorProd2026*Ok',
    );
    recordStep(
      'UC-0.3 Director (@dir.ensenanza) first-time login, mandatory password change & JWT rotation verified',
    );

    // Confirm baseline seed produces zero synthetic audit entries and the 22 institutional accounts.
    const initialAuditRes = await request<AuditLogEntry[]>({
      path: '/api/audit-logs?period=2026-2&limit=50',
      token: directorSession.token,
    });
    const initialAuditLogs = expectData(initialAuditRes, 200, 'Initial GET /api/audit-logs');
    assert.equal(initialAuditLogs.length, 1);
    assert.ok(initialAuditLogs[0]?.action.includes('Contraseña'));

    const initialUsersRes = await request<AuthUser[]>({
      path: '/api/users',
      token: directorSession.token,
    });
    const initialUsers = expectData(initialUsersRes, 200, 'Initial GET /api/users');
    assert.equal(initialUsers.length, 22);
    assert.ok(!initialUsers.some((u) => u.username === 'investigacion'));
    assert.ok(!initialUsers.some((u) => u.username === 'yolanda.fonseca'));

    const deanSession = await authenticateAndActivateAccount(
      'dec.industrial',
      'DeanProd2026*Ok',
    );
    recordStep(
      'UC-0.4 Dean (@dec.industrial · Ing. Industrial) first-time login & mandatory password change verified',
    );

    const viceRectorSession = await authenticateAndActivateAccount(
      'viceacademica',
      'ViceRectorProd2026*Ok',
    );
    recordStep(
      'UC-0.5 Vice-Rector (@viceacademica) first-time login & mandatory password change verified',
    );

    const provisionResearchRes = await request<ResetUserPasswordResponse>({
      method: 'POST',
      path: '/api/users',
      token: directorSession.token,
      body: {
        username: 'investigacion',
        fullName: 'Dirección de Investigación e Innovación',
        role: 'research',
        unitId: null,
      },
    });
    const provisionedResearch = expectData(
      provisionResearchRes,
      201,
      'POST /api/users (@investigacion)',
    );
    assert.ok(provisionedResearch.temporaryPassword.length >= 10);
    assert.notEqual(provisionedResearch.temporaryPassword, E2E_INITIAL_TEMP_PASSWORD);

    const researchSession = await authenticateAndActivateAccount(
      'investigacion',
      'ResearchProd2026*Ok',
      provisionedResearch.temporaryPassword,
    );
    recordStep(
      'UC-0.6 Research account provisioned with random temporary password, logged in & activated',
    );

    // Bearer-token authentication, header-forgery rejection, and multi-tenant RBAC isolation.
    const unauthRes = await request<PayrollSnapshot>({ path: '/api/state' });
    expectError(unauthRes, 401, 'Unauthenticated GET /api/state');

    const forgedRes = await request<PayrollSnapshot>({
      path: '/api/state',
      headers: {
        'X-Actor-Name': 'Forged Director',
        'X-Actor-Role': 'director',
      },
    });
    expectError(forgedRes, 401, 'Forged actor headers without Bearer token');
    recordStep('UC-1.1 Unauthenticated and forged-header requests rejected with HTTP 401');

    const crossTenantTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: deanSession.token,
      body: {
        unitId: 'arquitectura',
        fullName: 'Intento Cross-Tenant',
        documentId: '99887766',
        dedication: 'TC',
        rank: 'Auxiliar',
        education: 'Magíster',
        isProvisional: false,
      },
    });
    expectError(crossTenantTeacherRes, 403, 'Dean cross-tenant teacher creation');

    const deanCreateUnitRes = await request<UnitWithDirectorResponse>({
      method: 'POST',
      path: '/api/units',
      token: deanSession.token,
      body: {
        name: 'Facultad No Autorizada',
        division: 'División de Ingenierías y Arquitectura',
        unitType: 'Facultad',
        hasPostgraduates: false,
        deanName: 'Decano Intruso',
        qualityCap30411: 10,
        curriculumCap40106: 10,
        seaCap40109: 10,
        saberProCap40127: 10,
        graduatesCap20502: 10,
      },
    });
    expectError(deanCreateUnitRes, 403, 'Dean attempting Director-only POST /api/units');

    const researchCreateSacRes = await request<SacCode>({
      method: 'POST',
      path: '/api/sac-codes',
      token: researchSession.token,
      body: {
        code: '99111',
        name: 'Intento sin permiso',
        substantiveFunction: 'Investigación',
        definition: 'Prueba',
        guideline: 'Prueba',
        baseHours: null,
        capHours: 10,
        requiresViceRectorApproval: false,
        appliesTo: 'TC',
        severity: 'informative',
      },
    });
    expectError(researchCreateSacRes, 403, 'Research attempting POST /api/sac-codes');
    recordStep('UC-1.2 Multi-tenant unit isolation and role-based access control enforced (HTTP 403)');

    // Snapshot hydration, unstarted-unit submission guard, periods, and user directory.
    const stateRes = await request<PayrollSnapshot>({
      path: '/api/state',
      token: directorSession.token,
    });
    const snapshot = expectData(stateRes, 200, 'GET /api/state');
    assert.equal(snapshot.activePeriod, '2026-2');
    assert.equal(snapshot.units.length, 21);
    assert.equal(snapshot.teachers.length, 291);
    assert.equal(snapshot.sacCodes.length, 51);
    assert.ok(snapshot.programQuotas.length >= 28);
    assert.equal(snapshot.approvalRequests.length, 0);
    assert.equal(snapshot.researchAllocations.length, 0);
    assert.ok(
      snapshot.units.every(
        (u) =>
          u.payrollStatus === 'Borrador' &&
          u.currentVersion === 1 &&
          u.pendingAlerts === 0 &&
          u.pendingApprovals === 0,
      ),
    );
    assert.ok(
      snapshot.teachers.every(
        (t) => t.academicSpaces.length === 0 && Object.keys(t.allocations).length === 0,
      ),
    );
    const prematureSubmitRes = await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: '/api/units/ing-industrial/status',
      token: deanSession.token,
      body: {
        unitId: 'ing-industrial',
        status: 'Enviada',
        observation: 'Intento de envío en 0 horas',
      },
    });
    expectError(prematureSubmitRes, 422, 'Dean attempting to submit unstarted 0h unit');
    assert.equal(
      snapshot.units.find((u) => u.id === 'ing-industrial')?.deanName,
      'Juan Camilo Ernesto Valderrama Balaguera',
    );
    assert.equal(
      snapshot.units.find((u) => u.id === 'derecho')?.deanName,
      'Carlos Andrés Aranda Camacho',
    );
    assert.equal(
      snapshot.units.find((u) => u.id === 'lic-infantil')?.deanName,
      'Gladys Leonor Arias Rodríguez',
    );
    assert.ok(
      snapshot.sacCodes.every(
        (c) => !c.guideline.includes('INC-') && !c.name.includes('SIN CÓDIGO'),
      ),
    );
    recordStep(
      `UC-2.1 Clean Day-1 production state verified (${snapshot.units.length} units in Borrador v1, ${snapshot.teachers.length} preloaded teachers at 0h, 0 Day-1 alerts, 0 test approvals/research/logs, premature 0h submission blocked)`,
    );

    const periodsRes = await request<AcademicPeriod[]>({
      path: '/api/periods',
      token: directorSession.token,
    });
    const periods = expectData(periodsRes, 200, 'GET /api/periods');
    assert.equal(periods.length, 1);
    assert.ok(periods.some((p) => p.code === '2026-2' && p.isCurrent));

    const usersRes = await request<AuthUser[]>({
      path: '/api/users',
      token: directorSession.token,
    });
    const usersList = expectData(usersRes, 200, 'GET /api/users');
    assert.equal(usersList.length, 23);
    recordStep('UC-2.2 Active period (2026-2 only) and 22+1 institutional user accounts verified');

    // Academic unit lifecycle, auto-provisioned Dean account, and Annex 5 program quota rollups.
    const createUnitRes = await request<UnitWithDirectorResponse>({
      method: 'POST',
      path: '/api/units',
      token: directorSession.token,
      body: {
        name: 'Facultad de Ingeniería Biomédica',
        division: 'División de Ingenierías y Arquitectura',
        unitType: 'Facultad',
        hasPostgraduates: true,
        deanName: 'Dra. Elena Vargas Soto',
        username: 'elena.vargas',
        temporaryPassword: E2E_INITIAL_TEMP_PASSWORD,
        qualityCap30411: 20,
        curriculumCap40106: 20,
        seaCap40109: 20,
        saberProCap40127: 20,
        graduatesCap20502: 20,
      },
    });
    const createdUnitBundle = expectData(createUnitRes, 201, 'POST /api/units');
    const createdUnitId = createdUnitBundle.unit.id;
    assert.ok(createdUnitId.length > 0);
    assert.equal(createdUnitBundle.directorTeacher.expectedWorkload, 210);
    assert.deepEqual(createdUnitBundle.directorTeacher.allocations, {});
    assert.ok(createdUnitBundle.deanUser);
    assert.equal(createdUnitBundle.deanUser.username, 'elena.vargas');
    assert.equal(createdUnitBundle.temporaryPassword, E2E_INITIAL_TEMP_PASSWORD);
    recordStep(
      `UC-3.1 Created Academic Unit (${createdUnitId}) + clean 0h Director teacher (expected=210h) + Dean account (@elena.vargas)`,
    );

    const newDeanSession = await authenticateAndActivateAccount(
      'elena.vargas',
      'ElenaBiomed2026*Ok',
    );
    assert.equal(newDeanSession.user.unitId, createdUnitId);
    recordStep('UC-3.2 Newly provisioned Dean (@elena.vargas) logged in and activated credentials');

    const updateDeanRes = await request<UnitWithDirectorResponse>({
      method: 'PUT',
      path: `/api/units/${createdUnitId}/dean`,
      token: directorSession.token,
      body: {
        unitId: createdUnitId,
        deanName: 'Dr. Camilo Andrés Soto',
        documentId: '74123987',
      },
    });
    const updatedDeanBundle = expectData(
      updateDeanRes,
      200,
      'PUT /api/units/:id/dean',
    );
    assert.equal(updatedDeanBundle.unit.deanName, 'Dr. Camilo Andrés Soto');
    assert.equal(updatedDeanBundle.directorTeacher.fullName, 'DR. CAMILO ANDRÉS SOTO');
    recordStep('UC-3.3 Updated Unit Dean and synchronized Director teacher & user profile');

    const createProgramRes = await request<ProgramMutationResponse>({
      method: 'POST',
      path: '/api/programs',
      token: directorSession.token,
      body: {
        unitId: createdUnitId,
        programName: 'Ingeniería Biomédica',
        level: 'Pregrado',
        modality: 'Presencial',
        accreditationStatus: 'Registro Calificado',
        quality30411: 24,
        curriculum40106: 16,
        sea40109: 20,
        saberPro40127: 12,
        isActive: true,
      },
    });
    const createdProgram = expectData(createProgramRes, 201, 'POST /api/programs');
    assert.ok(createdProgram.program);
    assert.equal(createdProgram.unit.qualityCap30411, 24);
    assert.equal(createdProgram.unit.curriculumCap40106, 16);
    assert.equal(createdProgram.unit.seaCap40109, 20);
    assert.equal(createdProgram.unit.saberProCap40127, 12);

    const updateProgramRes = await request<ProgramMutationResponse>({
      method: 'PUT',
      path: `/api/programs/${createdProgram.program.id}`,
      token: directorSession.token,
      body: {
        id: createdProgram.program.id,
        programName: 'Ingeniería Biomédica (Alta Calidad)',
        accreditationStatus: 'Alta Calidad',
        quality30411: 32,
        curriculum40106: 20,
        sea40109: 28,
        saberPro40127: 16,
      },
    });
    const updatedProgram = expectData(updateProgramRes, 200, 'PUT /api/programs/:id');
    assert.equal(updatedProgram.unit.qualityCap30411, 32);
    assert.equal(updatedProgram.unit.curriculumCap40106, 20);
    assert.equal(updatedProgram.unit.seaCap40109, 28);
    assert.equal(updatedProgram.unit.saberProCap40127, 16);

    const listProgramsRes = await request<ProgramQuotaAnnex5[]>({
      path: `/api/programs?unitId=${createdUnitId}`,
      token: directorSession.token,
    });
    const unitPrograms = expectData(listProgramsRes, 200, 'GET /api/programs');
    assert.equal(unitPrograms.length, 1);

    const deleteProgramRes = await request<ProgramMutationResponse>({
      method: 'DELETE',
      path: `/api/programs/${createdProgram.program.id}`,
      token: directorSession.token,
    });
    expectData(deleteProgramRes, 200, 'DELETE /api/programs/:id');

    const deleteUnitRes = await request<DeletedResponse>({
      method: 'DELETE',
      path: `/api/units/${createdUnitId}`,
      token: directorSession.token,
    });
    const deletedUnitData = expectData(deleteUnitRes, 200, 'DELETE /api/units/:id');
    assert.equal(deletedUnitData.deletedId, createdUnitId);
    recordStep(
      'UC-3.4 Annex 5 Program CRUD and automatic faculty bag quota recalculation verified',
    );

    // Annex 4 SAC catalog CRUD, primary-key code rename, business rules, and schedule phases.
    const createSacRes = await request<SacCode>({
      method: 'POST',
      path: '/api/sac-codes',
      token: directorSession.token,
      body: {
        code: '90999',
        name: 'Laboratorio de Innovación Curricular E2E',
        substantiveFunction: 'Enseñanza-Aprendizaje',
        definition: 'Actividad experimental de innovación curricular',
        guideline: 'Máximo 8 horas mensuales por docente',
        baseHours: null,
        capHours: 8,
        requiresViceRectorApproval: false,
        appliesTo: 'TC / MT',
        severity: 'justifiable_alert',
        facultyRules: [
          {
            unitId: 'ing-industrial',
            unitName: 'Ingeniería Industrial',
            minTeacherHours: 2,
            maxTeacherHours: 8,
            facultyBagCap: 24,
          },
        ],
      },
    });
    const createdSac = expectData(createSacRes, 201, 'POST /api/sac-codes');
    assert.equal(createdSac.code, '90999');

    const getSacRes = await request<SacCode>({
      path: '/api/sac-codes/90999',
      token: directorSession.token,
    });
    const fetchedSac = expectData(getSacRes, 200, 'GET /api/sac-codes/90999');
    assert.equal(fetchedSac.capHours, 8);

    const updateSacRes = await request<SacCode>({
      method: 'PUT',
      path: '/api/sac-codes/90999',
      token: directorSession.token,
      body: {
        newCode: '90998',
        name: 'Laboratorio de Innovación Curricular E2E Actualizado',
        baseHours: 4,
        capHours: null,
        postgraduateCapHours: 16,
        requiresViceRectorApproval: true,
        annex3Format: '43401',
        mandatoryInFaculty: true,
        lockedByResearch: false,
        hoursPerUnitFactor: 4,
        unitLabel: 'proyecto',
      },
    });
    const updatedSac = expectData(updateSacRes, 200, 'PUT /api/sac-codes/90999 -> 90998');
    assert.equal(updatedSac.code, '90998');
    assert.equal(updatedSac.baseHours, 4);
    assert.equal(updatedSac.capHours, null);
    assert.equal(updatedSac.postgraduateCapHours, 16);
    assert.equal(updatedSac.requiresViceRectorApproval, true);
    assert.equal(updatedSac.annex3Format, '43401');
    assert.equal(updatedSac.mandatoryInFaculty, true);
    assert.equal(updatedSac.hoursPerUnitFactor, 4);
    assert.equal(updatedSac.unitLabel, 'proyecto');

    const oldSacRes = await request<SacCode>({
      path: '/api/sac-codes/90999',
      token: directorSession.token,
    });
    expectError(oldSacRes, 404, 'GET old /api/sac-codes/90999 after rename');

    const deleteSacRes = await request<DeletedResponse>({
      method: 'DELETE',
      path: '/api/sac-codes/90998',
      token: directorSession.token,
    });
    const deletedSac = expectData(deleteSacRes, 200, 'DELETE /api/sac-codes/90998');
    assert.equal(deletedSac.deletedId, '90998');
    recordStep(
      'UC-4.1 SAC Activity Code (Annex 4) create, full-attribute edit, code rename (90999->90998) & delete verified',
    );

    const rulesRes = await request<BusinessRulesConfig>({
      path: '/api/rules-config',
      token: directorSession.token,
    });
    const originalRules = expectData(rulesRes, 200, 'GET /api/rules-config');

    const updatedRulesRes = await request<BusinessRulesConfig>({
      method: 'PUT',
      path: '/api/rules-config',
      token: directorSession.token,
      body: {
        ...originalRules,
        minFullTimeTeachingHours: 52,
      },
    });
    const updatedRules = expectData(updatedRulesRes, 200, 'PUT /api/rules-config');
    assert.equal(updatedRules.minFullTimeTeachingHours, 52);

    await request<BusinessRulesConfig>({
      method: 'PUT',
      path: '/api/rules-config',
      token: directorSession.token,
      body: originalRules,
    });

    const originalPhase3 = snapshot.schedulePhases.find((p) => p.id === 'fase-3');
    assert.ok(originalPhase3, 'Expected fase-3 in schedulePhases');

    const updatePhaseRes = await request<SchedulePhase>({
      method: 'PUT',
      path: '/api/schedule-phases/fase-3',
      token: directorSession.token,
      body: {
        id: 'fase-3',
        label: originalPhase3.label,
        title: originalPhase3.title,
        dateRange: '06 Jul – 11 Jul',
        status: 'Activa',
      },
    });
    const updatedPhase = expectData(updatePhaseRes, 200, 'PUT /api/schedule-phases/fase-3');
    assert.equal(updatedPhase.dateRange, '06 Jul – 11 Jul');

    await request<SchedulePhase>({
      method: 'PUT',
      path: '/api/schedule-phases/fase-3',
      token: directorSession.token,
      body: originalPhase3,
    });
    recordStep(
      'UC-4.2 Institutional Business Rules & Schedule Phases configuration persistence verified',
    );

    // Faculty teacher roster CRUD, academic space assignments, and 25% PSE derivation.
    const createTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: deanSession.token,
      body: {
        unitId: 'ing-industrial',
        fullName: 'Ing. Martín Eduardo Rojas',
        documentId: '1049654321',
        dedication: 'TC',
        rank: 'Asistente',
        education: 'Magíster en Ingeniería Industrial',
        isProvisional: false,
      },
    });
    const createdTeacher = expectData(createTeacherRes, 201, 'POST /api/teachers (as Dean)');
    assert.equal(createdTeacher.unitId, 'ing-industrial');
    assert.equal(createdTeacher.expectedWorkload, 160);

    const updateTeacherRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${createdTeacher.id}`,
      token: deanSession.token,
      body: {
        rank: 'Asociado',
        generalNote: 'Docente de planta asignado a simulación y optimización',
      },
    });
    const updatedTeacher = expectData(updateTeacherRes, 200, 'PUT /api/teachers/:id');
    assert.equal(updatedTeacher.rank, 'Asociado');
    recordStep('UC-5.1 Dean created and updated Faculty Teacher in own unit (ing-industrial)');

    const addSpaceRes = await request<FacultyTeacher>({
      method: 'POST',
      path: `/api/teachers/${createdTeacher.id}/spaces`,
      token: deanSession.token,
      body: {
        level: 'Pregrado',
        name: 'Investigación de Operaciones II',
        hours: 48,
      },
    });
    const teacherWithSpace = expectData(addSpaceRes, 200, 'POST /api/teachers/:id/spaces');
    assert.equal(teacherWithSpace.academicSpaces.length, 1);
    assert.equal(WorkloadCalculatorDomain.computeHours40104(teacherWithSpace), 48);
    assert.equal(
      WorkloadCalculatorDomain.getEffectivePse(teacherWithSpace, originalRules),
      12,
    );

    const spaceId = teacherWithSpace.academicSpaces[0]!.id;
    const updateSpaceRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${createdTeacher.id}/spaces/${spaceId}`,
      token: deanSession.token,
      body: {
        hours: 64,
      },
    });
    const teacherWithUpdatedSpace = expectData(
      updateSpaceRes,
      200,
      'PUT /api/teachers/:id/spaces/:spaceId',
    );
    assert.equal(WorkloadCalculatorDomain.computeHours40104(teacherWithUpdatedSpace), 64);
    assert.equal(
      WorkloadCalculatorDomain.getEffectivePse(teacherWithUpdatedSpace, originalRules),
      16,
    );
    recordStep(
      'UC-5.2 Academic Space CRUD & automatic PSE (40108 = 25% of 40104) calculation verified',
    );

    const allocateSeaRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${createdTeacher.id}/allocations/40109`,
      token: deanSession.token,
      body: {
        hours: 12,
        exceptionJustification: 'Asignación acompañamiento estudiantil SEA',
      },
    });
    const teacherWithSea = expectData(
      allocateSeaRes,
      200,
      'PUT /api/teachers/:id/allocations/40109',
    );
    assert.equal(teacherWithSea.allocations['40109']?.hours, 12);

    const unitValidationRes = await request<UnitValidationEvaluation>({
      path: '/api/units/ing-industrial/validation',
      token: deanSession.token,
    });
    const unitValidation = expectData(
      unitValidationRes,
      200,
      'GET /api/units/ing-industrial/validation',
    );
    assert.equal(unitValidation.unitId, 'ing-industrial');
    assert.ok(unitValidation.bagIndicators.length > 0);
    assert.ok(Array.isArray(unitValidation.alerts));
    recordStep(
      'UC-5.3 SAC code allocation (40109) and real-time Annex 5/6 unit normative validation verified',
    );

    // Annex 3 Vice-Rectorate special approval workflow and RBAC decision guard.
    const createApprovalRes = await request<ApprovalRequestAnnex3>({
      method: 'POST',
      path: '/api/approvals',
      token: deanSession.token,
      body: {
        unitId: 'ing-industrial',
        unitName: 'Ingeniería Industrial',
        teacherId: createdTeacher.id,
        teacherName: createdTeacher.fullName,
        teacherDocumentId: createdTeacher.documentId,
        code: '10212',
        codeName: 'Dirección de Trabajos de Grado',
        requestedHours: 16,
        formatType: '10212',
        programName: 'Ingeniería Industrial',
        projectDetails: [
          {
            title: 'Optimización Logística Corredor Industrial de Boyacá',
            projectType: 'Trabajo de Grado Pregrado',
            studentsOrCourse: '2 estudiantes · X Semestre',
            committeeApprovalMinute: 'Acta Comité Curricular No. 14-2026',
            hours: 16,
          },
        ],
        attachmentUrl: 'https://santototunja.edu.co/anexo3/acta-14-2026.pdf',
      },
    });
    const createdApproval = expectData(createApprovalRes, 201, 'POST /api/approvals');
    assert.equal(createdApproval.status, 'Pendiente');

    const deanDecideAttempt = await request<ApprovalRequestAnnex3>({
      method: 'PATCH',
      path: `/api/approvals/${createdApproval.id}/decision`,
      token: deanSession.token,
      body: {
        id: createdApproval.id,
        status: 'Avalado',
        viceRectorNote: 'Intento no autorizado',
      },
    });
    expectError(deanDecideAttempt, 403, 'Dean attempting PATCH /api/approvals/:id/decision');

    const decideApprovalRes = await request<ApprovalRequestAnnex3>({
      method: 'PATCH',
      path: `/api/approvals/${createdApproval.id}/decision`,
      token: viceRectorSession.token,
      body: {
        id: createdApproval.id,
        status: 'Avalado',
        viceRectorNote: 'Avalado por Vicerrectoría Académica según acta de comité',
      },
    });
    const decidedApproval = expectData(
      decideApprovalRes,
      200,
      'PATCH /api/approvals/:id/decision (as Vice-Rector)',
    );
    assert.equal(decidedApproval.status, 'Avalado');
    assert.equal(decidedApproval.decidedBy, 'Fray Wilmar Yesid Ruiz Cortés, O.P.');
    recordStep(
      'UC-6.1 Annex 3 Vice-Rectorate Approval request (by Dean) and official decision (by Vice-Rector) verified',
    );

    // Annex 7 research allocation CRUD and bidirectional teacher allocation synchronization.
    const listResearchRes = await request<ResearchAllocationAnnex7[]>({
      path: '/api/research',
      token: researchSession.token,
    });
    const initialResearch = expectData(listResearchRes, 200, 'GET /api/research');
    assert.equal(initialResearch.length, 0);

    const createResearchRes = await request<ResearchMutationResponse>({
      method: 'POST',
      path: '/api/research',
      token: researchSession.token,
      body: {
        unitId: 'ing-industrial',
        unitName: 'Ingeniería Industrial',
        documentId: createdTeacher.documentId,
        teacherName: createdTeacher.fullName,
        code: '20222',
        activityName: 'Investigación en Proyectos FODEIN',
        projectOrGroup: 'FODEIN-2026-IND-99 · Gemelos Digitales en Manufactura Sostenible',
        role: 'Investigador Principal',
        sicddiLevel: 'Nivel I (20h)',
        weeklyHours: 5,
        monthlyHours: 20,
        isSicddiLocked: true,
        notes: 'Avalado por Comité SICDDI Seccional Tunja',
      },
    });
    const createdResearch = expectData(createResearchRes, 201, 'POST /api/research');
    assert.ok(createdResearch.allocation);
    assert.equal(createdResearch.allocation.monthlyHours, 20);
    assert.ok(createdResearch.teacher);
    assert.equal(createdResearch.teacher.allocations['20222']?.hours, 20);

    const updateResearchRes = await request<ResearchMutationResponse>({
      method: 'PUT',
      path: `/api/research/${createdResearch.allocation.id}`,
      token: researchSession.token,
      body: {
        id: createdResearch.allocation.id,
        weeklyHours: 8,
        monthlyHours: 32,
        notes: 'Ampliación de horas por cofinanciación externa',
      },
    });
    const updatedResearch = expectData(updateResearchRes, 200, 'PUT /api/research/:id');
    assert.ok(updatedResearch.allocation);
    assert.equal(updatedResearch.allocation.monthlyHours, 32);
    assert.ok(updatedResearch.teacher);
    assert.equal(updatedResearch.teacher.allocations['20222']?.hours, 32);

    const deleteResearchRes = await request<ResearchMutationResponse>({
      method: 'DELETE',
      path: `/api/research/${createdResearch.allocation.id}`,
      token: researchSession.token,
    });
    const deletedResearchData = expectData(
      deleteResearchRes,
      200,
      'DELETE /api/research/:id',
    );
    assert.ok(deletedResearchData.teacher);
    assert.equal(deletedResearchData.teacher.allocations['20222']?.hours ?? 0, 0);
    recordStep(
      'UC-7.1 Annex 7 Confidential Research CRUD & real-time synchronization with teacher SAC allocations verified',
    );

    const removeSpaceRes = await request<FacultyTeacher>({
      method: 'DELETE',
      path: `/api/teachers/${createdTeacher.id}/spaces/${spaceId}`,
      token: deanSession.token,
    });
    expectData(removeSpaceRes, 200, 'DELETE /api/teachers/:id/spaces/:spaceId');

    const deleteTeacherRes = await request<DeletedResponse>({
      method: 'DELETE',
      path: `/api/teachers/${createdTeacher.id}`,
      token: deanSession.token,
    });
    const deletedTeacher = expectData(deleteTeacherRes, 200, 'DELETE /api/teachers/:id');
    assert.equal(deletedTeacher.deletedId, createdTeacher.id);
    recordStep('UC-7.2 Teacher academic space removal and teacher deletion verified');

    // Unit version baselines, workflow transitions, and semester period cloning.
    const snapshotVersionRes = await request<UnitVersionSnapshotResponse>({
      method: 'POST',
      path: '/api/units/ing-industrial/version-snapshot',
      token: directorSession.token,
      body: {
        unitId: 'ing-industrial',
      },
    });
    const snapshotVersionData = expectData(
      snapshotVersionRes,
      200,
      'POST /api/units/ing-industrial/version-snapshot',
    );
    assert.ok(snapshotVersionData.unit.currentVersion >= 2);

    const statusChangeRes = await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: '/api/units/ing-industrial/status',
      token: directorSession.token,
      body: {
        unitId: 'ing-industrial',
        status: 'En Revisión',
        observation: 'Revisión técnica iniciada por Dirección E&A',
      },
    });
    const statusChangeData = expectData(
      statusChangeRes,
      200,
      'PATCH /api/units/ing-industrial/status',
    );
    assert.equal(statusChangeData.unit.payrollStatus, 'En Revisión');
    recordStep('UC-8.1 Unit payroll version snapshot & workflow status transition verified');

    const clonePeriodRes = await request<AcademicPeriod>({
      method: 'POST',
      path: '/api/periods',
      token: directorSession.token,
      body: {
        code: '2027-1',
        sourcePeriod: '2026-2',
        resetStatuses: true,
      },
    });
    const clonedPeriod = expectData(clonePeriodRes, 201, 'POST /api/periods (2027-1)');
    assert.equal(clonedPeriod.code, '2027-1');
    assert.equal(clonedPeriod.isCurrent, true);

    const clonedStateRes = await request<PayrollSnapshot>({
      path: '/api/state?period=2027-1',
      token: directorSession.token,
    });
    const clonedState = expectData(clonedStateRes, 200, 'GET /api/state?period=2027-1');
    assert.equal(clonedState.activePeriod, '2027-1');
    assert.equal(clonedState.units.length, 21);
    assert.ok(clonedState.units.every((u: AcademicUnitSummary) => u.payrollStatus === 'Borrador'));
    recordStep(
      'UC-8.2 Semester period cloning (2026-2 -> 2027-1) with status reset & roster migration verified',
    );

    // User account provisioning, administrative password reset, audit trail, and idempotent re-seeding.
    const createUserRes = await request<ResetUserPasswordResponse>({
      method: 'POST',
      path: '/api/users',
      token: directorSession.token,
      body: {
        username: 'coordinador.auditoria',
        fullName: 'Ing. Carlos Andrés Mendoza',
        role: 'director',
        unitId: null,
      },
    });
    const createdUserBundle = expectData(createUserRes, 201, 'POST /api/users');
    assert.equal(createdUserBundle.user.username, 'coordinador.auditoria');
    assert.equal(createdUserBundle.user.mustChangePassword, true);

    const resetPassRes = await request<ResetUserPasswordResponse>({
      method: 'POST',
      path: `/api/users/${createdUserBundle.user.id}/reset-password`,
      token: directorSession.token,
      body: {
        id: createdUserBundle.user.id,
      },
    });
    const resetPassData = expectData(
      resetPassRes,
      200,
      'POST /api/users/:id/reset-password',
    );
    assert.equal(resetPassData.user.mustChangePassword, true);

    const auditLogsRes = await request<AuditLogEntry[]>({
      path: '/api/audit-logs?period=2026-2&limit=50',
      token: directorSession.token,
    });
    const auditLogs = expectData(auditLogsRes, 200, 'GET /api/audit-logs');
    assert.ok(auditLogs.length >= 15);
    assert.ok(auditLogs.some((log) => log.user === 'Sandra Lizeth Parra Cruz'));
    assert.ok(
      auditLogs.some((log) => log.user === 'Juan Camilo Ernesto Valderrama Balaguera'),
    );
    recordStep(
      `UC-9.1 User provisioning, password reset & immutable audit trail (${auditLogs.length} entries) verified`,
    );

    // Ensure non-destructive startup reconciliation preserves activated user password hashes.
    await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: false,
    });
    const reloginDirectorRes = await request<AuthSessionResponse>({
      method: 'POST',
      path: '/api/auth/login',
      body: { username: 'dir.ensenanza', password: 'DirectorProd2026*Ok' },
    });
    const reloginDirector = expectData(
      reloginDirectorRes,
      200,
      'POST /api/auth/login after idempotent re-seed',
    );
    assert.equal(reloginDirector.user.mustChangePassword, false);
    recordStep(
      'UC-9.2 Idempotent production re-seed (deploy.sh path) preserves activated user passwords',
    );

    // Reverse-proxy HTTP verb tunneling, Acuerdo No. 48 nomenclature, and per-program allocations.
    const stateAfterReseedRes = await request<PayrollSnapshot>({
      path: '/api/state?period=2026-2',
      token: reloginDirector.token,
    });
    const stateAfterReseed = expectData(
      stateAfterReseedRes,
      200,
      'GET /api/state after re-seed',
    );

    const cienciasBasicas = stateAfterReseed.units.find((u) => u.id === 'ciencias-basicas');
    const humanidades = stateAfterReseed.units.find((u) => u.id === 'humanidades');
    assert.equal(cienciasBasicas?.name, 'Dirección de Ciencias Básicas');
    assert.equal(humanidades?.name, 'Dirección de Humanidades');
    assert.ok(
      stateAfterReseed.units.some(
        (u) => u.division === 'División de Ingenierías y Arquitectura',
      ),
    );
    assert.ok(
      stateAfterReseed.units.some(
        (u) => u.division === 'División de Ciencias Económicas y Administrativas',
      ),
    );
    recordStep(
      'UC-10.1 Official Acuerdo No. 48 de 2025 divisions and Dirección de Ciencias Básicas / Humanidades verified',
    );

    // Verify that adding an active Posgrado program automatically flips `unit.hasPostgraduates` to true.
    const newUnitNoPostgradRes = await request<UnitWithDirectorResponse>({
      method: 'POST',
      path: '/api/units',
      token: reloginDirector.token,
      body: {
        name: 'Inteligencia de Negocios Test',
        division: 'División de Ciencias Económicas y Administrativas',
        unitType: 'Facultad',
        deanName: 'Dra. Prueba Inteligencia',
        username: 'dec.inteligencia',
        temporaryPassword: E2E_INITIAL_TEMP_PASSWORD,
        hasPostgraduates: false,
        qualityCap30411: 16,
        curriculumCap40106: 16,
        seaCap40109: 8,
        saberProCap40127: 12,
        graduatesCap20502: 12,
      },
    });
    const newUnitNoPostgrad = expectData(
      newUnitNoPostgradRes,
      201,
      'POST /api/units (Inteligencia de Negocios Test)',
    );
    assert.equal(newUnitNoPostgrad.unit.hasPostgraduates, false);

    const addPostgradProgRes = await request<ProgramMutationResponse>({
      method: 'POST',
      path: '/api/programs',
      token: reloginDirector.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        programName: 'MAESTRÍA EN ANALÍTICA DE NEGOCIOS',
        level: 'Posgrado',
        modality: 'Híbrida',
        accreditationStatus: 'Registro Calificado Vigente',
        quality30411: 12,
        curriculum40106: 12,
        sea40109: 4,
        saberPro40127: 0,
        isActive: true,
      },
    });
    const addedPostgradProg = expectData(
      addPostgradProgRes,
      201,
      'POST /api/programs (Posgrado auto-enables hasPostgraduates)',
    );
    assert.equal(addedPostgradProg.unit.hasPostgraduates, true);
    assert.ok(addedPostgradProg.program);

    const createUnitTcTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: reloginDirector.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        fullName: 'Dra. Natalia Andrea Gómez',
        documentId: '1052987654',
        dedication: 'TC',
        rank: 'Asociado',
        education: 'Doctora en Analítica de Negocios',
        isProvisional: false,
      },
    });
    const unitTcTeacher = expectData(
      createUnitTcTeacherRes,
      201,
      'POST /api/teachers (TC teacher in Inteligencia de Negocios Test)',
    );

    // Exercise `POST` verb tunneling (`?_method=PUT` + `X-HTTP-Method-Override: PUT`) for per-program allocations.
    const tunneledAllocRes = await request<FacultyTeacher>({
      method: 'POST',
      path: `/api/teachers/${encodeURIComponent(unitTcTeacher.id)}/allocations/30411?_method=PUT`,
      token: reloginDirector.token,
      headers: { 'X-HTTP-Method-Override': 'PUT' },
      body: {
        hours: 12,
        programId: addedPostgradProg.program.id,
        programName: addedPostgradProg.program.programName,
      },
    });
    const tunneledTeacher = expectData(
      tunneledAllocRes,
      200,
      'POST ?_method=PUT /api/teachers/:id/allocations/30411 (tunneled PUT + programId)',
    );
    assert.equal(tunneledTeacher.allocations['30411']?.hours, 12);
    assert.equal(
      tunneledTeacher.allocations['30411']?.programId,
      addedPostgradProg.program.id,
    );
    assert.equal(
      tunneledTeacher.allocations['30411']?.programName,
      'MAESTRÍA EN ANALÍTICA DE NEGOCIOS',
    );

    const activePeriodStateRes = await request<PayrollSnapshot>({
      path: '/api/state',
      token: reloginDirector.token,
    });
    const activePeriodState = expectData(
      activePeriodStateRes,
      200,
      'GET /api/state (active period)',
    );
    const otherUnitTeacher = activePeriodState.teachers.find(
      (t) => t.unitId === 'ing-civil' && t.dedication === 'TC',
    );
    assert.ok(otherUnitTeacher, 'Expected TC teacher in ing-civil');
    const crossUnitProgramAllocRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${encodeURIComponent(otherUnitTeacher.id)}/allocations/30411`,
      token: reloginDirector.token,
      body: {
        hours: 8,
        programId: addedPostgradProg.program.id,
      },
    });
    expectError(
      crossUnitProgramAllocRes,
      400,
      'Reject cross-unit programId on SAC allocation',
    );
    recordStep(
      'UC-10.2 Apache/WAF POST method tunneling (?_method=PUT), per-program ANEXO 5 allocation & cross-unit programId guard verified',
    );

    // Multi-unit Dean scope (`managedUnitIds`), workflow edit locks, binary PDF attachments, and `CATEDRA` guards.
    const resetLenguasRes = await request<ResetUserPasswordResponse>({
      method: 'POST',
      path: '/api/users/user-dean-lic-lenguas/reset-password',
      token: reloginDirector.token,
      body: { id: 'user-dean-lic-lenguas' },
    });
    const resetLenguas = expectData(
      resetLenguasRes,
      200,
      'POST /api/users/user-dean-lic-lenguas/reset-password',
    );
    const licLenguasSession = await authenticateAndActivateAccount(
      'licenciaturaenlenguas',
      'DeanLenguas2026*Ok',
      resetLenguas.temporaryPassword,
    );
    assert.ok(licLenguasSession.user.managedUnitIds?.includes('lic-lenguas'));
    assert.ok(licLenguasSession.user.managedUnitIds?.includes('lic-infantil'));

    const scopedDeanStateRes = await request<PayrollSnapshot>({
      path: '/api/state',
      token: licLenguasSession.token,
    });
    const scopedDeanState = expectData(
      scopedDeanStateRes,
      200,
      'GET /api/state (scoped to multi-unit Dean)',
    );
    const scopedUnitIds = new Set(scopedDeanState.units.map((u) => u.id));
    assert.equal(scopedUnitIds.size, 2);
    assert.ok(scopedUnitIds.has('lic-lenguas') && scopedUnitIds.has('lic-infantil'));
    assert.ok(scopedDeanState.teachers.every((t) => scopedUnitIds.has(t.unitId)));
    assert.equal(scopedDeanState.researchAllocations.length, 0);

    const scopedAuditRes = await request<AuditLogEntry[]>({
      path: '/api/audit-logs?limit=50',
      token: licLenguasSession.token,
    });
    const scopedAuditLogs = expectData(
      scopedAuditRes,
      200,
      'GET /api/audit-logs (scoped to multi-unit Dean)',
    );
    const scopedUnitNames = new Set(scopedDeanState.units.map((u) => u.name));
    assert.ok(
      scopedAuditLogs.every((l) => !l.unitName || scopedUnitNames.has(l.unitName)),
      'Dean audit logs must only contain allowed units',
    );

    const lenguasTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: licLenguasSession.token,
      body: {
        unitId: 'lic-lenguas',
        fullName: 'Mg. Laura Sofía Castellanos',
        documentId: '1053112233',
        dedication: 'TC',
        rank: 'Auxiliar',
        education: 'Magíster en Didáctica de Lenguas',
        isProvisional: false,
      },
    });
    const lenguasTeacher = expectData(
      lenguasTeacherRes,
      201,
      'POST /api/teachers in lic-lenguas by multi-unit Dean',
    );

    const infantilTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: licLenguasSession.token,
      body: {
        unitId: 'lic-infantil',
        fullName: 'Mg. Paula Daniela Rincón',
        documentId: '1053445566',
        dedication: 'TC',
        rank: 'Auxiliar',
        education: 'Magíster en Educación Infantil',
        isProvisional: false,
      },
    });
    const infantilTeacher = expectData(
      infantilTeacherRes,
      201,
      'POST /api/teachers in lic-infantil by multi-unit Dean',
    );

    const crossValidationRes = await request<UnitValidationEvaluation>({
      path: '/api/units/derecho/validation',
      token: licLenguasSession.token,
    });
    expectError(
      crossValidationRes,
      403,
      'Multi-unit Dean blocked from GET /api/units/derecho/validation',
    );

    // Ensure `directorNote` is reserved exclusively for `director` actors.
    const deanSpoofNoteRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${infantilTeacher.id}/allocations/40109`,
      token: licLenguasSession.token,
      body: {
        hours: 8,
        directorNote: 'Intento de nota falsificada por Decano',
      },
    });
    expectError(
      deanSpoofNoteRes,
      403,
      'Dean blocked with HTTP 403 when attempting to set directorNote',
    );

    const deanValidAllocRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${infantilTeacher.id}/allocations/40109`,
      token: licLenguasSession.token,
      body: {
        hours: 8,
      },
    });
    const afterDeanValidAlloc = expectData(
      deanValidAllocRes,
      200,
      'PUT allocation by Dean without directorNote succeeds',
    );
    assert.equal(afterDeanValidAlloc.allocations['40109']?.hours, 8);
    assert.equal(afterDeanValidAlloc.allocations['40109']?.directorNote, undefined);

    const directorNoteRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${infantilTeacher.id}/allocations/40109`,
      token: reloginDirector.token,
      body: {
        hours: 8,
        directorNote: 'Ajustado por Dirección E&A en comité técnico',
      },
    });
    const afterDirectorNote = expectData(
      directorNoteRes,
      200,
      'PUT allocation by Director persists directorNote',
    );
    assert.equal(
      afterDirectorNote.allocations['40109']?.directorNote,
      'Ajustado por Dirección E&A en comité técnico',
    );
    recordStep(
      'UC-11.1 Multi-unit Dean (@licenciaturaenlenguas -> lic-lenguas + lic-infantil), tenant-scoped state/audit & directorNote guard verified',
    );

    // Dean submission (`Enviada`), mutation lock while submitted, withdrawal to `Borrador`, and `En Revisión` lock.
    const intelDeanSession = await authenticateAndActivateAccount(
      'dec.inteligencia',
      'DeanIntel2026*Ok',
    );
    await request<FacultyTeacher>({
      method: 'POST',
      path: `/api/teachers/${newUnitNoPostgrad.directorTeacher.id}/spaces`,
      token: intelDeanSession.token,
      body: { level: 'Posgrado', name: 'Seminario Directivo Analítica', hours: 16 },
    });
    await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${newUnitNoPostgrad.directorTeacher.id}/allocations/30222`,
      token: intelDeanSession.token,
      body: { hours: 160 },
    });
    await request<FacultyTeacher>({
      method: 'POST',
      path: `/api/teachers/${unitTcTeacher.id}/spaces`,
      token: intelDeanSession.token,
      body: { level: 'Pregrado', name: 'Modelos Predictivos Empresariales', hours: 64 },
    });

    const submitUnitRes = await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: `/api/units/${newUnitNoPostgrad.unit.id}/status`,
      token: intelDeanSession.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        status: 'Enviada',
        observation: 'Prenómina diligenciada y radicada por Decanatura',
      },
    });
    const submittedUnit = expectData(
      submitUnitRes,
      200,
      'PATCH /api/units/:id/status (Dean submits Borrador -> Enviada)',
    );
    assert.equal(submittedUnit.unit.payrollStatus, 'Enviada');
    assert.equal(submittedUnit.unit.currentVersion, 2);

    const lockedEditWhileSubmitted = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${unitTcTeacher.id}/allocations/40109`,
      token: intelDeanSession.token,
      body: { hours: 4 },
    });
    expectError(
      lockedEditWhileSubmitted,
      422,
      'Dean blocked from editing teacher while unit is Enviada',
    );

    const withdrawUnitRes = await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: `/api/units/${newUnitNoPostgrad.unit.id}/status`,
      token: intelDeanSession.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        status: 'Borrador',
        observation: 'Retiro de envío para ajuste previo a revisión',
      },
    });
    const withdrawnUnit = expectData(
      withdrawUnitRes,
      200,
      'PATCH /api/units/:id/status (Dean withdraws Enviada -> Borrador)',
    );
    assert.equal(withdrawnUnit.unit.payrollStatus, 'Borrador');

    const editAfterWithdrawRes = await request<FacultyTeacher>({
      method: 'PUT',
      path: `/api/teachers/${unitTcTeacher.id}/allocations/40109`,
      token: intelDeanSession.token,
      body: { hours: 4 },
    });
    expectData(
      editAfterWithdrawRes,
      200,
      'Dean can edit teacher again after withdrawing to Borrador',
    );

    await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: `/api/units/${newUnitNoPostgrad.unit.id}/status`,
      token: reloginDirector.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        status: 'En Revisión',
      },
    });
    const withdrawInReviewAttempt = await request<UnitVersionSnapshotResponse>({
      method: 'PATCH',
      path: `/api/units/${newUnitNoPostgrad.unit.id}/status`,
      token: intelDeanSession.token,
      body: {
        unitId: newUnitNoPostgrad.unit.id,
        status: 'Borrador',
      },
    });
    expectError(
      withdrawInReviewAttempt,
      422,
      'Dean cannot withdraw unit once Director moved it to En Revisión',
    );
    recordStep(
      'UC-11.2 Dean workflow submission (Enviada), mutation lock while submitted/in-review & withdraw-to-Borrador verified',
    );

    // Annex 3 binary PDF upload, `%PDF-` header signature verification, and tenant-scoped download.
    const spoofedPdfRes = await request<ApprovalAttachmentResponse>({
      method: 'POST',
      path: '/api/approvals/attachments',
      token: licLenguasSession.token,
      body: {
        fileName: 'acta-falsa.pdf',
        mimeType: 'application/pdf',
        contentBase64: Buffer.from('THIS_IS_NOT_A_PDF_FILE', 'utf8').toString('base64'),
      },
    });
    expectError(spoofedPdfRes, 400, 'Reject spoofed PDF failing %PDF- magic bytes');

    const realPdfBytes = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n',
      'utf8',
    );
    const uploadPdfRes = await request<ApprovalAttachmentResponse>({
      method: 'POST',
      path: '/api/approvals/attachments',
      token: licLenguasSession.token,
      body: {
        fileName: 'Acta Comite Curricular Lenguas 2027.pdf',
        mimeType: 'application/pdf',
        contentBase64: realPdfBytes.toString('base64'),
      },
    });
    const uploadedPdf = expectData(
      uploadPdfRes,
      201,
      'POST /api/approvals/attachments (valid %PDF-1.4)',
    );
    uploadedTestFiles.push(
      path.resolve(ENV_CONFIG.uploadsDir, 'annex3', uploadedPdf.fileName),
    );
    assert.ok(uploadedPdf.url.startsWith('/api/approvals/attachments/'));
    assert.ok(uploadedPdf.fileName.endsWith('.pdf'));

    const linkedApprovalRes = await request<ApprovalRequestAnnex3>({
      method: 'POST',
      path: '/api/approvals',
      token: licLenguasSession.token,
      body: {
        unitId: 'lic-lenguas',
        unitName: 'Licenciatura en Español y Lenguas Extranjeras',
        teacherId: lenguasTeacher.id,
        teacherName: lenguasTeacher.fullName,
        teacherDocumentId: lenguasTeacher.documentId,
        code: '10212',
        codeName: 'Dirección de Trabajos de Grado',
        requestedHours: 8,
        formatType: '10212',
        programName: 'Licenciatura en Español y Lenguas Extranjeras',
        projectDetails: [
          {
            title: 'Bilingüismo Crítico en Contextos Rurales',
            projectType: 'Trabajo de Grado Pregrado',
            studentsOrCourse: '2 estudiantes',
            committeeApprovalMinute: 'Acta No. 03-2027',
            hours: 8,
          },
        ],
        attachmentUrl: uploadedPdf.url,
      },
    });
    expectData(linkedApprovalRes, 201, 'POST /api/approvals with uploaded PDF URL');

    const unauthPdfFetch = await fetch(`${baseUrl}${uploadedPdf.url}`);
    assert.equal(unauthPdfFetch.status, 401, 'Unauthenticated PDF download must return 401');

    const crossDeanPdfFetch = await fetch(`${baseUrl}${uploadedPdf.url}`, {
      headers: { Authorization: `Bearer ${deanSession.token}` },
    });
    assert.equal(
      crossDeanPdfFetch.status,
      403,
      'Cross-unit Dean PDF download must return 403',
    );

    const vrPdfFetch = await fetch(`${baseUrl}${uploadedPdf.url}`, {
      headers: { Authorization: `Bearer ${viceRectorSession.token}` },
    });
    assert.equal(vrPdfFetch.status, 200, 'Vice-Rector PDF download must return 200');
    assert.ok(vrPdfFetch.headers.get('content-type')?.includes('application/pdf'));
    const downloadedBytes = Buffer.from(await vrPdfFetch.arrayBuffer());
    assert.equal(downloadedBytes.subarray(0, 8).toString('ascii'), '%PDF-1.4');
    assert.equal(downloadedBytes.length, realPdfBytes.length);
    recordStep(
      'UC-11.3 Annex 3 real PDF binary upload, %PDF- magic-bytes check & authenticated multi-tenant download verified',
    );

    // Annex 7 `CATEDRA` teacher exclusion and `ALLOW_DESTRUCTIVE_STATE_RESET` production guard.
    const catedraTeacherRes = await request<FacultyTeacher>({
      method: 'POST',
      path: '/api/teachers',
      token: reloginDirector.token,
      body: {
        unitId: 'ing-industrial',
        fullName: 'Ing. Jorge Enrique Cátedra',
        documentId: '1053998877',
        dedication: 'CATEDRA',
        rank: 'Auxiliar',
        education: 'Especialista en Logística',
        isProvisional: true,
      },
    });
    const catedraTeacher = expectData(
      catedraTeacherRes,
      201,
      'POST /api/teachers (CATEDRA teacher)',
    );

    const catedraResearchRes = await request<ResearchMutationResponse>({
      method: 'POST',
      path: '/api/research',
      token: researchSession.token,
      body: {
        unitId: 'ing-industrial',
        unitName: 'Ingeniería Industrial',
        documentId: catedraTeacher.documentId,
        teacherName: catedraTeacher.fullName,
        code: '20222',
        activityName: 'Investigación en Proyectos FODEIN',
        projectOrGroup: 'Intento Investigación Cátedra',
        role: 'Coinvestigador',
        sicddiLevel: 'Nivel I (20h)',
        weeklyHours: 5,
        monthlyHours: 20,
        isSicddiLocked: false,
      },
    });
    expectError(
      catedraResearchRes,
      422,
      'Reject Annex 7 research allocation for CATEDRA teacher',
    );

    const resetBlockedRes = await request<PayrollSnapshot>({
      method: 'POST',
      path: '/api/state/reset',
      token: reloginDirector.token,
    });
    expectError(
      resetBlockedRes,
      403,
      'Block POST /api/state/reset when ALLOW_DESTRUCTIVE_STATE_RESET is disabled',
    );
    recordStep(
      'UC-11.4 Hora Cátedra (CATEDRA) research exclusion & production destructive-reset lock verified',
    );

    console.log('\n====================================================================');
    console.log(
      ` ALL ${passedAssertions} PRODUCTION E2E VERIFICATION STEPS PASSED WITH ZERO ERRORS`,
    );
    console.log('====================================================================\n');
  } finally {
    for (const filePath of uploadedTestFiles) {
      await fs.unlink(filePath).catch(() => undefined);
    }
    // Restore baseline seed data so local MariaDB state remains clean after suite teardown.
    await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: true,
    });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.destroy();
  }
}

runProductionE2ESuite().catch((error) => {
  console.error('\n[E2E FAILURE] Production E2E test suite failed:', error);
  process.exit(1);
});
