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

export class AcademicOrganizationDomain {
  public static deriveUsernameFromFullName(fullName: string): string {
    const cleaned = fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\b(fr|o\.?p|op|ing|dr|dra|mg|ph\.?d|phd|lic|esp|abg|arq)\.?\b/gi, ' ')
      .replace(/[^a-zA-Z\s]/g, ' ')
      .trim()
      .toLowerCase();
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

  public static recalculateUnitCapsFromPrograms(
    unit: AcademicUnitSummary,
    programQuotas: ProgramQuotaAnnex5[],
  ): boolean {
    const activePrograms = programQuotas.filter(
      (p) => p.unitId === unit.id && p.isActive,
    );
    if (activePrograms.length === 0) return false;
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

  public static buildNewUnitAndDirector(
    payload: CreateAcademicUnitPayload,
    currentUnitsCount: number,
    ids: IdGenerator,
  ): { unit: AcademicUnitSummary; directorTeacher: FacultyTeacher } {
    const unit: AcademicUnitSummary = {
      id: ids.next(),
      name: payload.name.trim(),
      division: payload.division.trim(),
      unitType: payload.unitType,
      hasPostgraduates: payload.hasPostgraduates,
      deanName: payload.deanName.trim() || 'Decano(a) Titular',
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
        documentId: String(1053000001 + currentUnitsCount),
        education: `Magíster en ${unit.name}`,
      },
      ids,
    );

    return { unit, directorTeacher };
  }

  /**
   * Applies a dean change. Returns the newly created director teacher when the
   * unit had none, so the caller can persist it explicitly.
   */
  public static updateDeanAndDirectorTeacher(
    unit: AcademicUnitSummary,
    teachers: FacultyTeacher[],
    payload: UpdateUnitDeanPayload,
    totalUnits: number,
    ids: IdGenerator,
  ): { previousDeanName: string; directorTeacher: FacultyTeacher; created: boolean } {
    const previousDeanName = unit.deanName;
    unit.deanName = payload.deanName.trim();

    const existing = teachers.find(
      (t) => t.unitId === payload.unitId && t.dedication === 'DIRECTIVO',
    );
    if (existing) {
      existing.fullName = payload.deanName.trim().toUpperCase();
      if (payload.documentId) existing.documentId = payload.documentId.trim();
      if (payload.education) existing.education = payload.education.trim();
      if (payload.rank) existing.rank = payload.rank.trim();
      if (payload.expectedWorkload) existing.expectedWorkload = payload.expectedWorkload;
      return { previousDeanName, directorTeacher: existing, created: false };
    }

    const directorTeacher = AcademicOrganizationDomain.buildDirectorTeacher(
      unit,
      {
        ...payload,
        documentId: payload.documentId?.trim() || String(1053000000 + totalUnits),
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
    const workload = payload.expectedWorkload || 210;
    return {
      id: ids.next(),
      unitId: unit.id,
      documentId: payload.documentId ?? '',
      fullName: payload.deanName.trim().toUpperCase(),
      dedication: 'DIRECTIVO',
      expectedWorkload: workload,
      rank:
        payload.rank?.trim() ||
        (unit.unitType === 'Facultad' ? 'Decano(a) de Facultad' : 'Director(a) de Unidad'),
      education: payload.education?.trim() || `Magíster · ${unit.name}`,
      isProvisional: false,
      seniorityYears: 5,
      version1Total: workload,
      academicSpaces: [
        {
          id: ids.next(),
          name: 'SEMINARIO DISCIPLINAR I',
          level: 'Pregrado',
          monthlyHours: 16,
        },
      ],
      allocations: { '30222': { code: '30222', hours: 190, version1Hours: 190 } },
    };
  }
}
