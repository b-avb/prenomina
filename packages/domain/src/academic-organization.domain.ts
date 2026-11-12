import type {
  AcademicUnitSummary,
  FacultyTeacher,
  ProgramQuotaAnnex5,
} from './types/payroll.types.js';
import type { IdGenerator } from './ports/id-generator.js';

export interface CreateAcademicUnitPayload {
  name: string;
  division: string;
  unitType: 'Facultad' | 'Dirección Académica';
  deanName: string;
  documentId?: string;
  username?: string;
  temporaryPassword?: string;
  hasPostgraduates: boolean;
  qualityCap30411: number;
  curriculumCap40106: number;
  seaCap40109: number;
  saberProCap40127: number;
  graduatesCap20502: number;
}

export interface UpdateUnitDeanPayload {
  unitId: string;
  deanName: string;
  username?: string;
  temporaryPassword?: string;
  documentId?: string;
  education?: string;
  rank?: string;
  expectedWorkload?: number;
}

/**
 * Common Colombian middle given names used to disambiguate 3-token full names
 * (`<firstGiven> <secondGiven> <firstSurname>` vs `<firstGiven> <firstSurname> <secondSurname>`)
 * when deriving `firstGiven.firstSurname` institutional usernames.
 */
const COMMON_SECOND_GIVEN_NAMES = new Set([
  'fernando',
  'andres',
  'mauricio',
  'enrique',
  'camilo',
  'hernan',
  'esteban',
  'dario',
  'yesid',
  'lizeth',
  'elizabeth',
  'patricia',
  'johana',
  'lorena',
  'milena',
  'angela',
  'maria',
  'marcela',
  'cecilia',
  'andrea',
  'carlos',
  'jose',
  'luis',
]);

/**
 * Strips diacritics and ecclesiastical/academic prefixes (`Fr.`, `O.P.`, `Mg.`, `Ph.D.`, etc.)
 * so Dean names on academic units can be matched deterministically against roster entries.
 */
function normalizePersonName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fr|o\.?p|op|ing|dr|dra|mg|ph\.?d|phd|lic|esp|abg|arq)\.?\b/gi, ' ')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Domain rules governing academic units, Annex 5 program-to-unit quota rollups,
 * and synchronization between unit Deans and `DIRECTIVO` roster records.
 */
export class AcademicOrganizationDomain {
  /** Derives a lowercase `given.surname` login identifier from a full Spanish name. */
  public static deriveUsernameFromFullName(fullName: string): string {
    const cleaned = normalizePersonName(fullName);
    const tokens = cleaned.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return 'usuario.usta';
    if (tokens.length === 1) return tokens[0]!;
    if (tokens.length === 2) return `${tokens[0]}.${tokens[1]}`;
    if (tokens.length === 3) {
      if (COMMON_SECOND_GIVEN_NAMES.has(tokens[1]!)) {
        return `${tokens[0]}.${tokens[2]}`;
      }
      return `${tokens[0]}.${tokens[1]}`;
    }
    return `${tokens[0]}.${tokens[tokens.length - 2]}`;
  }

  /**
   * Recomputes `hasPostgraduates` and Annex 5 bag caps (`30411`, `40106`, `40109`, `40127`)
   * on `unit` by summing its active programs. Leaves `graduatesCap20502` (Annex 6) untouched,
   * and preserves manual unit caps when the unit has zero registered programs unless forced.
   */
  public static recalculateUnitCapsFromPrograms(
    unit: AcademicUnitSummary,
    programQuotas: ProgramQuotaAnnex5[],
    options?: { forceZeroWhenNoPrograms?: boolean },
  ): boolean {
    const unitPrograms = programQuotas.filter((p) => p.unitId === unit.id);
    if (unitPrograms.length === 0 && !options?.forceZeroWhenNoPrograms) {
      return false;
    }
    const activePrograms = unitPrograms.filter((p) => p.isActive);
    unit.hasPostgraduates = activePrograms.some(
      (p) =>
        p.level === 'Posgrado' ||
        /\b(posgrados?|especializaci[oó]n|especializaciones|maestr[ií]as?|doctorados?)\b/i.test(
          p.programName,
        ),
    );
    unit.qualityCap30411 = activePrograms.reduce(
      (acc, p) => acc + (Number(p.quality30411) || 0),
      0,
    );
    unit.curriculumCap40106 = activePrograms.reduce(
      (acc, p) => acc + (Number(p.curriculum40106) || 0),
      0,
    );
    unit.seaCap40109 = activePrograms.reduce((acc, p) => acc + (Number(p.sea40109) || 0), 0);
    unit.saberProCap40127 = activePrograms.reduce(
      (acc, p) => acc + (Number(p.saberPro40127) || 0),
      0,
    );
    return true;
  }

  /** Creates a `Borrador` v1 academic unit together with its initial `0 h` `DIRECTIVO` teacher record. */
  public static buildNewUnitAndDirector(
    payload: CreateAcademicUnitPayload,
    _currentUnitsCount: number,
    ids: IdGenerator,
  ): { unit: AcademicUnitSummary; directorTeacher: FacultyTeacher } {
    const unit: AcademicUnitSummary = {
      id: ids.next(),
      name: payload.name.trim(),
      division: payload.division.trim(),
      unitType: payload.unitType,
      hasPostgraduates: payload.hasPostgraduates,
      deanName: payload.deanName.trim() || 'Decanatura Titular',
      payrollStatus: 'Borrador',
      currentVersion: 1,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      qualityCap30411: payload.qualityCap30411,
      curriculumCap40106: payload.curriculumCap40106,
      seaCap40109: payload.seaCap40109,
      saberProCap40127: payload.saberProCap40127,
      graduatesCap20502: payload.graduatesCap20502,
      totalTeachers: 1,
      pendingAlerts: 0,
      pendingApprovals: 0,
    };

    const directorTeacher = AcademicOrganizationDomain.buildDirectorTeacher(
      unit,
      {
        unitId: unit.id,
        deanName: unit.deanName,
        documentId: payload.documentId?.trim(),
        education: '',
      },
      ids,
    );

    return { unit, directorTeacher };
  }

  /**
   * Updates `unit.deanName` and reconciles the corresponding `DIRECTIVO` teacher row in `teachers`.
   * Matches by `documentId`, previous/next normalized name, or existing `DIRECTIVO` slot; creates a
   * new `DIRECTIVO` teacher (`created: true`) only when no candidate exists in the unit.
   */
  public static updateDeanAndDirectorTeacher(
    unit: AcademicUnitSummary,
    teachers: FacultyTeacher[],
    payload: UpdateUnitDeanPayload,
    _totalUnits: number,
    ids: IdGenerator,
  ): { previousDeanName: string; directorTeacher: FacultyTeacher; created: boolean } {
    const previousDeanName = unit.deanName;
    const normalizedPrev = normalizePersonName(previousDeanName);
    const normalizedNext = normalizePersonName(payload.deanName);
    const cleanDoc = payload.documentId?.trim();
    unit.deanName = payload.deanName.trim();

    const unitTeachers = teachers.filter((t) => t.unitId === payload.unitId);
    const existing =
      (cleanDoc ? unitTeachers.find((t) => t.documentId === cleanDoc) : undefined) ??
      (normalizedPrev
        ? unitTeachers.find((t) => normalizePersonName(t.fullName) === normalizedPrev)
        : undefined) ??
      (normalizedNext
        ? unitTeachers.find((t) => normalizePersonName(t.fullName) === normalizedNext)
        : undefined) ??
      unitTeachers.find((t) => t.dedication === 'DIRECTIVO');

    if (existing) {
      const wasDirectivo = existing.dedication === 'DIRECTIVO';
      existing.fullName = payload.deanName.trim().toUpperCase();
      existing.dedication = 'DIRECTIVO';
      if (cleanDoc) {
        existing.documentId = cleanDoc;
        existing.isProvisional = false;
      }
      if (payload.education !== undefined && payload.education.trim()) {
        existing.education = payload.education.trim();
      }
      if (payload.rank !== undefined && payload.rank.trim()) {
        existing.rank = payload.rank.trim();
      }
      if (payload.expectedWorkload) {
        existing.expectedWorkload = payload.expectedWorkload;
      } else if (!wasDirectivo) {
        existing.expectedWorkload = 210;
      }
      return { previousDeanName, directorTeacher: existing, created: false };
    }

    const directorTeacher = AcademicOrganizationDomain.buildDirectorTeacher(
      unit,
      {
        ...payload,
        documentId: cleanDoc,
      },
      ids,
    );
    teachers.unshift(directorTeacher);
    return { previousDeanName, directorTeacher, created: true };
  }

  private static buildDirectorTeacher(
    unit: AcademicUnitSummary,
    payload: UpdateUnitDeanPayload,
    ids: IdGenerator,
  ): FacultyTeacher {
    const id = ids.next();
    const workload = payload.expectedWorkload || 210;
    const cleanDoc = payload.documentId?.trim() || '';
    return {
      id,
      unitId: unit.id,
      documentId: cleanDoc || `VACANTE-${id.slice(0, 8).toUpperCase()}`,
      fullName: payload.deanName.trim().toUpperCase(),
      dedication: 'DIRECTIVO',
      expectedWorkload: workload,
      rank:
        payload.rank?.trim() ||
        (unit.unitType === 'Facultad' ? 'Decanatura de Facultad' : 'Dirección de Unidad'),
      education: payload.education?.trim() || '',
      isProvisional: !cleanDoc,
      seniorityYears: 0,
      academicSpaces: [],
      allocations: {},
    };
  }
}
