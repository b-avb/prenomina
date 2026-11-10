import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PayrollRole } from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import { ENV_CONFIG } from '../config/env.config.js';
import type { AcademicProgramsController } from '../controllers/academic-programs.controller.js';
import type { AcademicUnitsController } from '../controllers/academic-units.controller.js';
import type { ApprovalsController } from '../controllers/approvals.controller.js';
import type { AuditLogsController } from '../controllers/audit-logs.controller.js';
import type { AuthController } from '../controllers/auth.controller.js';
import type { FacultyTeachersController } from '../controllers/faculty-teachers.controller.js';
import type { PayrollStateController } from '../controllers/payroll-state.controller.js';
import type { ResearchController } from '../controllers/research.controller.js';
import type { SacCatalogController } from '../controllers/sac-catalog.controller.js';
import type { ValidationEngineController } from '../controllers/validation-engine.controller.js';
import { BadRequestError } from '../utils/app-error.js';
import { mapErrorToHttpFailure } from '../utils/error-mapper.js';
import {
  type RouteHandler,
  type RouteParams,
  sendFailure,
  sendNoContent,
} from '../utils/http.utils.js';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIST_DIR = path.resolve(CURRENT_DIR, '../../../usta-web/dist');

const MIME_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function tryServeWebSpa(pathname: string, res: ServerResponse): Promise<boolean> {
  try {
    let cleanPathname = pathname;
    const assetMatch = cleanPathname.match(/\/(assets\/.+|images\/.+|favicon\.ico)$/);
    if (assetMatch?.[1]) {
      cleanPathname = `/${assetMatch[1]}`;
    }

    const safeRelative = cleanPathname === '/' ? 'index.html' : cleanPathname.replace(/^\/+/, '');
    const candidatePath = path.resolve(WEB_DIST_DIR, safeRelative);
    if (!candidatePath.startsWith(WEB_DIST_DIR)) {
      return false;
    }

    let filePath = candidatePath;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch {
      filePath = path.join(WEB_DIST_DIR, 'index.html');
    }

    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RouteAccessPolicy =
  | 'public'
  | 'pending_password_allowed'
  | 'authenticated';

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  access: RouteAccessPolicy;
  allowedRoles?: readonly PayrollRole[];
  handler: RouteHandler;
}

interface CompiledRoute extends RouteDefinition {
  segments: string[];
}

export interface ApiControllers {
  auth: AuthController;
  payrollState: PayrollStateController;
  academicUnits: AcademicUnitsController;
  academicPrograms: AcademicProgramsController;
  sacCatalog: SacCatalogController;
  facultyTeachers: FacultyTeachersController;
  validationEngine: ValidationEngineController;
  approvals: ApprovalsController;
  research: ResearchController;
  auditLogs: AuditLogsController;
}

function splitPath(pathname: string): string[] {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return normalized.split('/').filter(Boolean);
}

function matchPathSegments(
  patternSegments: string[],
  actualSegments: string[],
): RouteParams | null {
  if (patternSegments.length !== actualSegments.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const pattern = patternSegments[i]!;
    const actual = actualSegments[i]!;
    if (pattern.startsWith(':')) {
      const paramName = pattern.slice(1);
      try {
        params[paramName] = decodeURIComponent(actual);
      } catch {
        throw new BadRequestError(
          `El parámetro de ruta ':${paramName}' no tiene una codificación URI válida.`,
        );
      }
    } else if (pattern !== actual) {
      return null;
    }
  }
  return params;
}

export class ApiRouter {
  private readonly routes: CompiledRoute[];

  constructor(
    controllers: ApiControllers,
    private readonly actorResolver: ActorResolver,
  ) {
    const definitions: RouteDefinition[] = [
      // 0. Authentication & User Credentials (Local Temporary Password + Microsoft Entra ID AD SSO)
      {
        method: 'GET',
        path: '/api/auth/config',
        access: 'public',
        handler: controllers.auth.config,
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        access: 'public',
        handler: controllers.auth.login,
      },
      {
        method: 'POST',
        path: '/api/auth/microsoft',
        access: 'public',
        handler: controllers.auth.loginWithMicrosoft,
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        access: 'pending_password_allowed',
        handler: controllers.auth.me,
      },
      {
        method: 'POST',
        path: '/api/auth/change-password',
        access: 'pending_password_allowed',
        handler: controllers.auth.changePassword,
      },
      {
        method: 'GET',
        path: '/api/users',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.auth.listUsers,
      },
      {
        method: 'POST',
        path: '/api/users',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.auth.createUser,
      },
      {
        method: 'POST',
        path: '/api/users/:id/reset-password',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.auth.resetUserPassword,
      },

      // 1. System Health, Read Snapshot & Academic Periods
      {
        method: 'GET',
        path: '/api/health',
        access: 'public',
        handler: controllers.payrollState.getHealth,
      },
      {
        method: 'GET',
        path: '/api/state',
        access: 'authenticated',
        handler: controllers.payrollState.getState,
      },
      {
        method: 'POST',
        path: '/api/state/reset',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.payrollState.resetState,
      },
      {
        method: 'GET',
        path: '/api/periods',
        access: 'authenticated',
        handler: controllers.payrollState.listPeriods,
      },
      {
        method: 'POST',
        path: '/api/periods',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.payrollState.createPeriod,
      },

      // 2. Academic Units, Deans, Workflow & Validation
      {
        method: 'GET',
        path: '/api/units',
        access: 'authenticated',
        handler: controllers.academicUnits.list,
      },
      {
        method: 'GET',
        path: '/api/units/:id',
        access: 'authenticated',
        handler: controllers.academicUnits.getById,
      },
      {
        method: 'POST',
        path: '/api/units',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicUnits.create,
      },
      {
        method: 'PUT',
        path: '/api/units/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicUnits.update,
      },
      {
        method: 'PUT',
        path: '/api/units/:id/dean',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicUnits.updateDean,
      },
      {
        method: 'PATCH',
        path: '/api/units/:id/status',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.academicUnits.changeStatus,
      },
      {
        method: 'POST',
        path: '/api/units/:id/version-snapshot',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.academicUnits.snapshotVersion,
      },
      {
        method: 'GET',
        path: '/api/units/:id/validation',
        access: 'authenticated',
        handler: controllers.validationEngine.getUnitValidation,
      },
      {
        method: 'POST',
        path: '/api/units/:id/teachers/import',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.importRoster,
      },
      {
        method: 'DELETE',
        path: '/api/units/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicUnits.remove,
      },

      // 3. Academic Programs & Annex 5 Quotas
      {
        method: 'GET',
        path: '/api/programs',
        access: 'authenticated',
        handler: controllers.academicPrograms.list,
      },
      {
        method: 'POST',
        path: '/api/programs',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicPrograms.create,
      },
      {
        method: 'PUT',
        path: '/api/programs/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicPrograms.update,
      },
      {
        method: 'DELETE',
        path: '/api/programs/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.academicPrograms.remove,
      },

      // 4. SAC Catalog (Annex 4), Institutional Rules Config & Schedule Phases
      {
        method: 'GET',
        path: '/api/sac-codes',
        access: 'authenticated',
        handler: controllers.sacCatalog.list,
      },
      {
        method: 'GET',
        path: '/api/sac-codes/:code',
        access: 'authenticated',
        handler: controllers.sacCatalog.getByCode,
      },
      {
        method: 'POST',
        path: '/api/sac-codes',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.create,
      },
      {
        method: 'POST',
        path: '/api/sac-codes/import',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.importCatalog,
      },
      {
        method: 'PUT',
        path: '/api/sac-codes/:code',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.update,
      },
      {
        method: 'DELETE',
        path: '/api/sac-codes/:code',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.remove,
      },
      {
        method: 'GET',
        path: '/api/rules-config',
        access: 'authenticated',
        handler: controllers.sacCatalog.getRulesConfig,
      },
      {
        method: 'PUT',
        path: '/api/rules-config',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.updateRulesConfig,
      },
      {
        method: 'PUT',
        path: '/api/schedule-phases/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.management,
        handler: controllers.sacCatalog.updateSchedulePhase,
      },

      // 5. Faculty Teachers, Academic Spaces & SAC Allocations (Annex 2)
      {
        method: 'GET',
        path: '/api/teachers',
        access: 'authenticated',
        handler: controllers.facultyTeachers.list,
      },
      {
        method: 'GET',
        path: '/api/teachers/:id',
        access: 'authenticated',
        handler: controllers.facultyTeachers.getById,
      },
      {
        method: 'POST',
        path: '/api/teachers',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.create,
      },
      {
        method: 'PUT',
        path: '/api/teachers/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.update,
      },
      {
        method: 'DELETE',
        path: '/api/teachers/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.remove,
      },
      {
        method: 'POST',
        path: '/api/teachers/:teacherId/spaces',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.addAcademicSpace,
      },
      {
        method: 'PUT',
        path: '/api/teachers/:teacherId/spaces/:spaceId',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.updateAcademicSpace,
      },
      {
        method: 'DELETE',
        path: '/api/teachers/:teacherId/spaces/:spaceId',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.removeAcademicSpace,
      },
      {
        method: 'PUT',
        path: '/api/teachers/:teacherId/allocations/:code',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.facultyTeachers.updateCodeAllocation,
      },

      // 6. Vice-Rectorate Approvals (Annex 3)
      {
        method: 'GET',
        path: '/api/approvals',
        access: 'authenticated',
        handler: controllers.approvals.list,
      },
      {
        method: 'POST',
        path: '/api/approvals',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.workload,
        handler: controllers.approvals.create,
      },
      {
        method: 'PATCH',
        path: '/api/approvals/:id/decision',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.approvalDecision,
        handler: controllers.approvals.decide,
      },

      // 7. Research Matrix (Annex 7)
      {
        method: 'GET',
        path: '/api/research',
        access: 'authenticated',
        handler: controllers.research.list,
      },
      {
        method: 'POST',
        path: '/api/research',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.research,
        handler: controllers.research.create,
      },
      {
        method: 'PUT',
        path: '/api/research/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.research,
        handler: controllers.research.update,
      },
      {
        method: 'DELETE',
        path: '/api/research/:id',
        access: 'authenticated',
        allowedRoles: ROLE_PERMISSIONS.research,
        handler: controllers.research.remove,
      },

      // 8. Immutable Server-Side Audit Trail
      {
        method: 'GET',
        path: '/api/audit-logs',
        access: 'authenticated',
        handler: controllers.auditLogs.list,
      },
    ];

    this.routes = definitions.map((def) => ({
      ...def,
      segments: splitPath(def.path),
    }));
  }

  public dispatch = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === 'OPTIONS') {
      sendNoContent(res);
      return;
    }

    const url = new URL(req.url ?? '/', `http://localhost:${ENV_CONFIG.port}`);
    const method = (req.method ?? 'GET').toUpperCase();
    const normalizedPathname =
      url.pathname.replace(/^\/(?:app\/)?prenomina(?=\/|$)/, '') || '/';
    const actualSegments = splitPath(normalizedPathname);

    try {
      for (const route of this.routes) {
        if (route.method !== method) continue;
        const params = matchPathSegments(route.segments, actualSegments);
        if (params !== null) {
          if (route.access === 'pending_password_allowed') {
            await this.actorResolver.resolve(req, route.allowedRoles, {
              allowPendingPasswordChange: true,
            });
          } else if (route.access === 'authenticated') {
            await this.actorResolver.resolve(req, route.allowedRoles);
          }
          await route.handler(req, res, url, params);
          return;
        }
      }

      if (method === 'GET' && !normalizedPathname.startsWith('/api')) {
        const served = await tryServeWebSpa(normalizedPathname, res);
        if (served) return;
      }

      sendFailure(res, 404, {
        ok: false,
        code: 'ROUTE_NOT_FOUND',
        error: `Ruta no encontrada: ${method} ${url.pathname}`,
      });
    } catch (error) {
      const failure = mapErrorToHttpFailure(error);
      sendFailure(res, failure.statusCode, failure.body);
    }
  };
}
