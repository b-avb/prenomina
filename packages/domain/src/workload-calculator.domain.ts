import type {
  AcademicUnitSummary,
  BusinessRulesConfig,
  FacultyTeacher,
} from './types/payroll.types.js';

/** Summary of an academic unit's monthly hour consumption against an Annex 5 or Annex 6 bag quota. */
export interface FacultyBagIndicator {
  code: string;
  title: string;
  fullTitle: string;
  source: 'Anexo 5' | 'Anexo 6';
  allocated: number;
  cap: number;
  status: 'ok' | 'warn' | 'error' | 'pending';
}

/**
 * Deterministic monthly workload calculator for Annex 2 faculty rosters and
 * Annex 5/6 unit-level bag indicators.
 */
export class WorkloadCalculatorDomain {
  /** Sums direct undergraduate teaching hours (`40104`) across assigned `Pregrado` academic spaces. */
  public static computeHours40104(teacher: FacultyTeacher): number {
    return teacher.academicSpaces
      .filter((s) => s.level === 'Pregrado')
      .reduce((acc, item) => acc + (Number(item.monthlyHours) || 0), 0);
  }

  /**
   * Resolves monthly postgraduate teaching hours (`40006`). Prefers itemized `Posgrado`
   * spaces when present and falls back to a direct `40006` code allocation otherwise.
   */
  public static computeHours40006(teacher: FacultyTeacher): number {
    const fromSpaces = teacher.academicSpaces
      .filter((s) => s.level === 'Posgrado')
      .reduce((acc, item) => acc + (Number(item.monthlyHours) || 0), 0);
    const fromCode = teacher.allocations['40006']?.hours ?? 0;
    return fromSpaces > 0 ? fromSpaces : fromCode;
  }

  /**
   * Computes normative Preparation, Monitoring, and Evaluation (`40108`) monthly hours:
   * 25% of undergraduate teaching (`40104`) plus an optional 12.5% of postgraduate teaching (`40006`).
   * Adjunct (`CATEDRA`) teachers are excluded from PSE allocation under institutional rules.
   */
  public static computeExactPse25(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    if (teacher.dedication === 'CATEDRA') return 0;
    const h40104 = this.computeHours40104(teacher);
    const h40006 = rules.includePostgraduateInPse125 ? this.computeHours40006(teacher) : 0;
    return Math.round((h40104 * 0.25 + h40006 * 0.125) * 10) / 10;
  }

  /** Returns `pseManualOverride` when set, or the formula-derived PSE (`40108`) otherwise. */
  public static getEffectivePse(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    if (teacher.dedication === 'CATEDRA') return 0;
    if (teacher.pseManualOverride !== undefined && teacher.pseManualOverride !== null) {
      return teacher.pseManualOverride;
    }
    return this.computeExactPse25(teacher, rules);
  }

  /**
   * Sums monthly hours across all SAC allocations except `40104` and `40108`,
   * which are derived from `academicSpaces` and `getEffectivePse` to prevent double counting.
   */
  public static computeOtherSacHours(teacher: FacultyTeacher): number {
    return Object.values(teacher.allocations).reduce((acc, a) => {
      if (a.code === '40104' || a.code === '40108') return acc;
      return acc + (Number(a.hours) || 0);
    }, 0);
  }

  /** Computes total monthly hours committed by a teacher within their primary unit. */
  public static computeTeacherTotalHours(
    teacher: FacultyTeacher,
    rules: BusinessRulesConfig,
  ): number {
    const h40104 = this.computeHours40104(teacher);
    const pse = this.getEffectivePse(teacher, rules);
    const otherCodes = this.computeOtherSacHours(teacher);
    return h40104 + pse + otherCodes;
  }

  /** Aggregates total monthly hours allocated to `code` across all teachers belonging to `unitId`. */
  public static sumCodeInUnit(
    teachers: FacultyTeacher[],
    unitId: string,
    code: string,
    rules: BusinessRulesConfig,
  ): number {
    const unitTeachers = teachers.filter((t) => t.unitId === unitId);
    return unitTeachers.reduce((acc, t) => {
      if (code === '40104') return acc + this.computeHours40104(t);
      if (code === '40006') return acc + this.computeHours40006(t);
      if (code === '40108') return acc + this.getEffectivePse(t, rules);
      return acc + (t.allocations[code]?.hours ?? 0);
    }, 0);
  }

  /**
   * Returns true when a teacher has zero spaces, zero SAC allocations, zero shared hours,
   * and no positive PSE override—used to suppress premature Day-1 incomplete-workload alerts
   * while a `Borrador` unit has not started data entry.
   */
  public static isTeacherUnstarted(teacher: FacultyTeacher): boolean {
    const hasSpaces = teacher.academicSpaces.some((s) => (Number(s.monthlyHours) || 0) > 0);
    if (hasSpaces) return false;
    const hasAllocations = Object.values(teacher.allocations).some(
      (a) => (Number(a.hours) || 0) > 0,
    );
    if (hasAllocations) return false;
    if ((Number(teacher.sharedHours) || 0) > 0) return false;
    if (
      teacher.pseManualOverride !== undefined &&
      teacher.pseManualOverride !== null &&
      teacher.pseManualOverride > 0
    ) {
      return false;
    }
    return true;
  }

  /** Returns true when every teacher in `unitId` is unstarted (`0 h`). */
  public static isUnitUnstarted(teachers: FacultyTeacher[], unitId: string): boolean {
    const unitTeachers = teachers.filter((t) => t.unitId === unitId);
    return unitTeachers.every((t) => this.isTeacherUnstarted(t));
  }

  /**
   * Evaluates consumption against the five unit-level hour bags (Annex 5: `30411`, `40106`,
   * `40109`, `40127`; Annex 6: `20502`). Marks bags as `pending` rather than `warn` when an
   * unstarted `Borrador` unit is still at `0 h`.
   */
  public static computeUnitBagIndicators(
    unit: AcademicUnitSummary | undefined,
    teachers: FacultyTeacher[],
    rules: BusinessRulesConfig,
  ): FacultyBagIndicator[] {
    if (!unit) return [];
    const unitUnstarted =
      unit.payrollStatus === 'Borrador' && this.isUnitUnstarted(teachers, unit.id);
    const definitions: Omit<FacultyBagIndicator, 'status'>[] = [
      {
        code: '30411',
        title: 'Calidad',
        fullTitle: 'Aseguramiento de la Calidad',
        source: 'Anexo 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '30411', rules),
        cap: unit.qualityCap30411,
      },
      {
        code: '40106',
        title: 'Currículo',
        fullTitle: 'Gestión Curricular',
        source: 'Anexo 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40106', rules),
        cap: unit.curriculumCap40106,
      },
      {
        code: '40109',
        title: 'Pruebas SEA',
        fullTitle: 'Pruebas Académicas SEA',
        source: 'Anexo 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40109', rules),
        cap: unit.seaCap40109,
      },
      {
        code: '40127',
        title: 'Saber Pro',
        fullTitle: 'Pruebas Saber Pro',
        source: 'Anexo 5',
        allocated: this.sumCodeInUnit(teachers, unit.id, '40127', rules),
        cap: unit.saberProCap40127,
      },
      {
        code: '20502',
        title: 'Graduados',
        fullTitle: 'Gestión de Graduados',
        source: 'Anexo 6',
        allocated: this.sumCodeInUnit(teachers, unit.id, '20502', rules),
        cap: unit.graduatesCap20502,
      },
    ];

    return definitions.map((b) => {
      let status: FacultyBagIndicator['status'] = 'ok';
      if (b.allocated > b.cap) status = 'error';
      else if (unitUnstarted && b.allocated === 0 && b.cap > 0) status = 'pending';
      else if (b.allocated < b.cap) status = 'warn';
      return { ...b, status };
    });
  }
}
