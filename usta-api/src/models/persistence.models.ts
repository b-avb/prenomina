import type {
  AcademicUnitSummary,
  AuthProvider,
  PayrollRole,
  PayrollStatus,
  ProgramQuotaAnnex5,
} from '@usta/domain';

/**
 * Server-side persistence models that are not part of the shared read contract.
 */

/** Fields of `AcademicUnitSummary` computed at read time for a given period (never stored). */
export type AcademicUnitDerivedField =
  | 'payrollStatus'
  | 'currentVersion'
  | 'updatedAt'
  | 'totalTeachers'
  | 'pendingAlerts'
  | 'pendingApprovals';

/** Stored profile of an academic unit (global, not period-scoped). */
export type AcademicUnitRecord = Omit<AcademicUnitSummary, AcademicUnitDerivedField> & {
  updatedAt: string;
};

/** Payroll workflow state of a unit inside one academic period. */
export interface UnitPayrollCycle {
  unitId: string;
  periodCode: string;
  payrollStatus: PayrollStatus;
  currentVersion: number;
  updatedAt: string;
}

/** Programs store only the unit id; `unitName` is resolved by join on read. */
export type AcademicProgramRecord = Omit<ProgramQuotaAnnex5, 'unitName'>;

/** Stored user account including password hash and optional AD / Entra ID identity fields. */
export interface UserRecord {
  id: string;
  username: string;
  email?: string | null;
  entraOid?: string | null;
  authProvider?: AuthProvider;
  passwordHash: string;
  fullName: string;
  role: PayrollRole;
  unitId: string | null;
  mustChangePassword: boolean;
  isActive: boolean;
  passwordChangedAt: string | null;
  lastLoginAt?: string | null;
  updatedAt: string;
}

/** Wraps an entity whose shared type does not carry its academic period. */
export interface PeriodScoped<T> {
  periodCode: string;
  entity: T;
}

export interface LockOptions {
  /** Acquire a row lock (`SELECT … FOR UPDATE`); only meaningful inside a transaction. */
  forUpdate?: boolean;
}

