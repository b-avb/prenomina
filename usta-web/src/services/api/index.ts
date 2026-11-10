import { apiClient } from '../api.client';
import { createApprovalsApi } from './approvals.api';
import { createAuditApi } from './audit.api';
import { createAuthApi } from './auth.api';
import { createPeriodsApi } from './periods.api';
import { createProgramsApi } from './programs.api';
import { createResearchApi } from './research.api';
import { createRulesApi } from './rules.api';
import { createSacCodesApi } from './sac-codes.api';
import { createSnapshotApi } from './snapshot.api';
import { createTeachersApi } from './teachers.api';
import { createUnitsApi } from './units.api';

/** Resource clients bound to the application HTTP client. */
export const authApi = createAuthApi(apiClient);
export const snapshotApi = createSnapshotApi(apiClient);
export const periodsApi = createPeriodsApi(apiClient);
export const rulesApi = createRulesApi(apiClient);
export const unitsApi = createUnitsApi(apiClient);
export const programsApi = createProgramsApi(apiClient);
export const sacCodesApi = createSacCodesApi(apiClient);
export const teachersApi = createTeachersApi(apiClient);
export const approvalsApi = createApprovalsApi(apiClient);
export const researchApi = createResearchApi(apiClient);
export const auditApi = createAuditApi(apiClient);

