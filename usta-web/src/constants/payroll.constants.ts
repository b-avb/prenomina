import type { AcademicUnitSummary, BusinessRulesConfig } from '@usta/domain';

/**
 * Client-side fallback unit rendered only until initial hydration from
 * `GET /api/state` completes. Authoritative institutional data resides in `usta-api`.
 */
export const FALLBACK_ACADEMIC_UNIT: Readonly<AcademicUnitSummary> = Object.freeze({
  id: '',
  name: 'Cargando unidad académica…',
  division: 'Seccional Tunja',
  unitType: 'Facultad',
  hasPostgraduates: false,
  deanName: '—',
  payrollStatus: 'Borrador',
  currentVersion: 1,
  updatedAt: '',
  qualityCap30411: 0,
  curriculumCap40106: 0,
  seaCap40109: 0,
  saberProCap40127: 0,
  graduatesCap20502: 0,
  totalTeachers: 0,
  pendingAlerts: 0,
  pendingApprovals: 0,
});

/** Default validation parameters used prior to loading persisted institutional rules from `usta-api`. */
export const DEFAULT_RULES_CONFIG: Readonly<BusinessRulesConfig> = Object.freeze({
  includePostgraduateInPse125: false,
  enforceAnnex6CapOnGraduates: true,
  blockSubmissionWithBlockingAlerts: true,
  minFullTimeTeachingHours: 64,
  maxRecommendedAcademicSpaces: 4,
});

/** Trunk SAC codes computed from academic spaces; they can never be removed from the catalog. */
export const TRUNK_SAC_CODES: readonly string[] = ['40104', '40108'];

/** Structural SAC codes referenced by institutional domain formulas and bag quotas. */
export const STRUCTURAL_SAC_CODES: readonly string[] = [
  '40104',
  '40108',
  '40006',
  '10226',
  '30411',
  '40106',
  '40109',
  '40127',
  '20502',
];
