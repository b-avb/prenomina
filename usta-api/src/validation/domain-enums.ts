import type {
  AcademicUnitSummary,
  ApprovalStatus,
  AssignedAcademicSpace,
  AuthProvider,
  PayrollRole,
  PayrollStatus,
  ProgramQuotaAnnex5,
  RuleSeverity,
  SchedulePhase,
  SubstantiveFunction,
  TeacherDedication,
} from '@usta/domain';
import type { Annex3Format, SicddiLevel } from '../database/database.types.js';

/**
 * Runtime lists of the domain union types, used by request validation.
 * Declaring them as `Record<Union, true>` makes the compiler enforce exhaustiveness.
 */
function keysOf<T extends string>(record: Record<T, true>): readonly T[] {
  return Object.keys(record) as T[];
}

export const PAYROLL_ROLES = keysOf<PayrollRole>({
  director: true,
  dean: true,
  vice_rector: true,
  research: true,
});

export const AUTH_PROVIDERS = keysOf<AuthProvider>({
  local: true,
  microsoft_entra: true,
  hybrid: true,
});

export const PAYROLL_STATUSES = keysOf<PayrollStatus>({
  Borrador: true,
  Enviada: true,
  'En Revisión': true,
  'Devuelta con Observaciones': true,
  Avalada: true,
});

export const APPROVAL_STATUSES = keysOf<ApprovalStatus>({
  Pendiente: true,
  Avalado: true,
  'Con Observaciones': true,
  Rechazado: true,
});

export const TEACHER_DEDICATIONS = keysOf<TeacherDedication>({
  TC: true,
  MT: true,
  CATEDRA: true,
  DIRECTIVO: true,
});

export const ACADEMIC_LEVELS = keysOf<AssignedAcademicSpace['level']>({
  Pregrado: true,
  Posgrado: true,
});

export const PROGRAM_MODALITIES = keysOf<ProgramQuotaAnnex5['modality']>({
  Presencial: true,
  Virtual: true,
  Híbrida: true,
});

export const UNIT_TYPES = keysOf<AcademicUnitSummary['unitType']>({
  Facultad: true,
  'Dirección Académica': true,
});

export const SUBSTANTIVE_FUNCTIONS = keysOf<SubstantiveFunction>({
  'Enseñanza-Aprendizaje': true,
  'Proyección Social': true,
  Investigación: true,
  'Gestión Académica': true,
});

export const RULE_SEVERITIES = keysOf<RuleSeverity>({
  blocking: true,
  justifiable_alert: true,
  informative: true,
});

export const ANNEX3_FORMATS = keysOf<Annex3Format>({
  '10212': true,
  '20223_20120': true,
  '20222': true,
  '40126': true,
  '40222': true,
  '43401': true,
});

export const SICDDI_LEVELS = keysOf<SicddiLevel>({
  'Nivel I (20h)': true,
  'Nivel II (80h)': true,
  'Nivel III (136h)': true,
});

export const PHASE_STATUSES = keysOf<SchedulePhase['status']>({
  Completada: true,
  Activa: true,
  Programada: true,
});

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}
