import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  ACTOR_HEADERS,
  DEFAULT_TEMPORARY_PASSWORD,
  type AcademicPeriod,
  type AcademicUnitSummary,
  type ApiFailure,
  type ApiSuccess,
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

async function runProductionE2ESuite(): Promise<void> {
  const db = createDatabase(ENV_CONFIG.database);
  const tx = new KyselyTransactionRunner(db);
  const repos = createMariaDbRepositories();
  const ids = new UuidIdGenerator();
  const actorResolver = new JwtActorResolver(tx.executor, repos.users);

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

  try {
    console.log('\n====================================================================');
    console.log(' USTA TUNJA — PRODUCTION E2E SUITE (REAL HTTP + REAL MARIADB, 0 MOCKS)');
    console.log('====================================================================\n');

    // Ensure clean canonical database seed before starting the full lifecycle
    await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: true,
      preferJsonSnapshot: false,
    });

    // -------------------------------------------------------------------------
    // UC-0: System Health, Auth Config & Mandatory First-Login Password Change
    // -------------------------------------------------------------------------
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

    async function authenticateAndActivateAccount(
      username: string,
      newPersonalPassword: string,
    ): Promise<{ token: string; user: AuthUser }> {
      const loginRes = await request<AuthSessionResponse>({
        method: 'POST',
        path: '/api/auth/login',
        body: { username, password: DEFAULT_TEMPORARY_PASSWORD },
      });
      const initialSession = expectData(loginRes, 200, `POST /api/auth/login (${username})`);
      assert.equal(initialSession.user.mustChangePassword, true);

      // Verify protected routes reject JWT while mustChangePassword is true
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

      // Change password via real HTTP endpoint
      const changeRes = await request<AuthSessionResponse>({
        method: 'POST',
        path: '/api/auth/change-password',
        token: initialSession.token,
        body: {
          currentPassword: DEFAULT_TEMPORARY_PASSWORD,
          newPassword: newPersonalPassword,
        },
      });
      const activeSession = expectData(
        changeRes,
        200,
        `POST /api/auth/change-password (${username})`,
      );
      assert.equal(activeSession.user.mustChangePassword, false);

      // Verify old JWT is immediately revoked via pwdRev mismatch
      const oldTokenCheck = await request<AuthUser>({
        path: '/api/auth/me',
        token: initialSession.token,
      });
      expectError(oldTokenCheck, 401, `Revoked old JWT after password change (${username})`);

      // Verify new JWT works on /api/auth/me
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
      'sandra.parra',
      'DirectorProd2026*Ok',
    );
    recordStep(
      'UC-0.3 Director (@sandra.parra) first-time login, mandatory password change & JWT rotation verified',
    );

    const deanSession = await authenticateAndActivateAccount(
      'gloria.grimaldo',
      'DeanProd2026*Ok',
    );
    recordStep(
      'UC-0.4 Dean (@gloria.grimaldo · Ing. Industrial) first-time login & mandatory password change verified',
    );

    const viceRectorSession = await authenticateAndActivateAccount(
      'wilmar.ruiz',
      'ViceRectorProd2026*Ok',
    );
    recordStep(
      'UC-0.5 Vice-Rector (@wilmar.ruiz) first-time login & mandatory password change verified',
    );

    const researchSession = await authenticateAndActivateAccount(
      'investigacion',
      'ResearchProd2026*Ok',
    );
    recordStep(
      'UC-0.6 Research Director (@investigacion) first-time login & mandatory password change verified',
    );

    // -------------------------------------------------------------------------
    // UC-1: Zero-Trust Security, Header Forgery Rejection & Multi-Tenant RBAC
    // -------------------------------------------------------------------------
    const unauthRes = await request<PayrollSnapshot>({ path: '/api/state' });
    expectError(unauthRes, 401, 'Unauthenticated GET /api/state');

    const forgedRes = await request<PayrollSnapshot>({
      path: '/api/state',
      headers: {
        [ACTOR_HEADERS.name]: 'Forged Director',
        [ACTOR_HEADERS.role]: 'director',
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

    // -------------------------------------------------------------------------
    // UC-2: Full State Hydration, Periods & Institutional Users Directory
    // -------------------------------------------------------------------------
    const stateRes = await request<PayrollSnapshot>({
      path: '/api/state',
      token: directorSession.token,
    });
    const snapshot = expectData(stateRes, 200, 'GET /api/state');
    assert.equal(snapshot.activePeriod, '2026-2');
    assert.equal(snapshot.units.length, 21);
    assert.equal(snapshot.teachers.length, 291);
    assert.equal(snapshot.sacCodes.length, 51);
    assert.equal(snapshot.programQuotas.length, 21);
    recordStep(
      `UC-2.1 Full institutional state hydrated (${snapshot.units.length} units, ${snapshot.teachers.length} teachers, ${snapshot.sacCodes.length} SAC codes)`,
    );

    const periodsRes = await request<AcademicPeriod[]>({
      path: '/api/periods',
      token: directorSession.token,
    });
    const periods = expectData(periodsRes, 200, 'GET /api/periods');
    assert.ok(periods.some((p) => p.code === '2026-2' && p.isCurrent));

    const usersRes = await request<AuthUser[]>({
      path: '/api/users',
      token: directorSession.token,
    });
    const usersList = expectData(usersRes, 200, 'GET /api/users');
    assert.equal(usersList.length, 24);
    recordStep('UC-2.2 Academic periods and 24 institutional user accounts verified');

    // -------------------------------------------------------------------------
    // UC-3: Academic Units, Auto-Provisioned Dean Login & Annex 5 Program Quotas
    // -------------------------------------------------------------------------
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
    assert.equal(createdUnitBundle.directorTeacher.allocations['30222']?.hours, 190);
    assert.ok(createdUnitBundle.deanUser);
    assert.equal(createdUnitBundle.deanUser.username, 'elena.vargas');
    recordStep(
      `UC-3.1 Created Academic Unit (${createdUnitId}) + Director teacher (30222=190h, total=210h) + Dean account (@elena.vargas)`,
    );

    // Log in with the newly provisioned Dean account and change password via HTTP
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

    // -------------------------------------------------------------------------
    // UC-4: SAC Catalog (Annex 4), Institutional Rules Config & Schedule Phases
    // -------------------------------------------------------------------------
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
        capHours: 12,
        name: 'Laboratorio de Innovación Curricular E2E Actualizado',
      },
    });
    const updatedSac = expectData(updateSacRes, 200, 'PUT /api/sac-codes/90999');
    assert.equal(updatedSac.capHours, 12);

    const deleteSacRes = await request<DeletedResponse>({
      method: 'DELETE',
      path: '/api/sac-codes/90999',
      token: directorSession.token,
    });
    const deletedSac = expectData(deleteSacRes, 200, 'DELETE /api/sac-codes/90999');
    assert.equal(deletedSac.deletedId, '90999');
    recordStep('UC-4.1 SAC Activity Code (Annex 4) create, read, update & delete verified');

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

    // -------------------------------------------------------------------------
    // UC-5: Faculty Workload, Academic Spaces & Automatic PSE (Annex 2, 5, 6)
    // -------------------------------------------------------------------------
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
    ); // Automatic PSE = 25% of 48h = 12h

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
    ); // Automatic PSE = 25% of 64h = 16h
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

    // -------------------------------------------------------------------------
    // UC-6: Vice-Rectorate Approvals Workflow — Annex 3
    // -------------------------------------------------------------------------
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

    // Verify Dean cannot decide an Annex 3 approval
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

    // Vice-Rector decides the approval
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
    assert.equal(decidedApproval.decidedBy, 'Fr. Wilmar Yesid Ruiz Cortés, O.P.');
    recordStep(
      'UC-6.1 Annex 3 Vice-Rectorate Approval request (by Dean) and official decision (by Vice-Rector) verified',
    );

    // -------------------------------------------------------------------------
    // UC-7: Confidential Research Matrix — Annex 7
    // -------------------------------------------------------------------------
    const listResearchRes = await request<ResearchAllocationAnnex7[]>({
      path: '/api/research',
      token: researchSession.token,
    });
    const initialResearch = expectData(listResearchRes, 200, 'GET /api/research');
    assert.ok(initialResearch.length > 0);

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

    // Clean up test space and test teacher via HTTP
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

    // -------------------------------------------------------------------------
    // UC-8: Payroll Workflow, Version Snapshot & Semester Period Cloning
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // UC-9: User Account Provisioning, Password Reset & Immutable Audit Trail
    // -------------------------------------------------------------------------
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
    assert.ok(auditLogs.some((log) => log.user === 'Gloria Elizabeth Grimaldo León'));
    recordStep(
      `UC-9.1 User provisioning, password reset & immutable audit trail (${auditLogs.length} entries) verified`,
    );

    console.log('\n====================================================================');
    console.log(
      ` ALL ${passedAssertions} PRODUCTION E2E VERIFICATION STEPS PASSED WITH ZERO ERRORS`,
    );
    console.log('====================================================================\n');
  } finally {
    // Restore canonical official seed data so the database stays clean after tests
    await seedDatabaseWithOfficialData(tx, repos, ids, {
      forceTruncate: true,
      preferJsonSnapshot: false,
    });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.destroy();
  }
}

runProductionE2ESuite().catch((error) => {
  console.error('\n[E2E FAILURE] Production E2E test suite failed:', error);
  process.exit(1);
});
